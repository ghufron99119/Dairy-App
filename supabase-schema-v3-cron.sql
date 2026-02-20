-- =============================================
-- Nexus Personal Website - Schema V3: Daily Auto-Checklist
-- Run this AFTER supabase-schema-v2.sql
-- =============================================
--
-- PREREQUISITE:
-- 1. Aktifkan pg_cron di Supabase Dashboard → Database → Extensions → Search "pg_cron" → Enable
-- 2. Ganti 'GANTI_DENGAN_UUID_USER_KAMU' di bawah dengan UUID kamu
--    (bisa dilihat di Supabase Dashboard → Authentication → Users)
--
-- =============================================

-- =============================================
-- 1. Function: Auto-generate 5 waktu sholat ke checklist_items
--    (Hanya insert item BARU jika belum ada untuk user tersebut)
-- =============================================
CREATE OR REPLACE FUNCTION public.ensure_sholat_checklist_items()
RETURNS void AS $$
DECLARE
    sholat_items TEXT[] := ARRAY['Subuh', 'Dhuhur', 'Ashar', 'Maghrib', 'Isya'];
    sholat_name TEXT;
    target_user_id UUID;
    item_exists BOOLEAN;
BEGIN
    -- Loop through all users yang punya profile
    FOR target_user_id IN SELECT id FROM auth.users
    LOOP
        FOREACH sholat_name IN ARRAY sholat_items
        LOOP
            -- Cek apakah item sudah ada untuk user ini
            SELECT EXISTS(
                SELECT 1 FROM public.checklist_items
                WHERE user_id = target_user_id
                  AND title = sholat_name
                  AND category = 'daily'
                  AND is_active = true
            ) INTO item_exists;

            -- Insert hanya jika belum ada
            IF NOT item_exists THEN
                INSERT INTO public.checklist_items (user_id, title, category, is_active, sort_order)
                VALUES (target_user_id, sholat_name, 'daily', true,
                    CASE sholat_name
                        WHEN 'Subuh'   THEN 1
                        WHEN 'Dhuhur'  THEN 2
                        WHEN 'Ashar'   THEN 3
                        WHEN 'Maghrib' THEN 4
                        WHEN 'Isya'    THEN 5
                    END
                );
            END IF;
        END LOOP;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =============================================
-- 2. Function: Reset daily checklist logs (create fresh logs for today)
--    Ini memastikan bahwa setiap hari baru ada row kosong yang siap di-check
-- =============================================
CREATE OR REPLACE FUNCTION public.generate_daily_checklist_logs()
RETURNS void AS $$
DECLARE
    -- Gunakan timezone Jakarta agar sinkron dengan user WIB
    target_date DATE := (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Jakarta')::DATE;
    rec RECORD;
    log_exists BOOLEAN;
BEGIN
    -- Loop through semua active checklist items yang berkategori daily
    FOR rec IN
        SELECT ci.id AS item_id, ci.user_id
        FROM public.checklist_items ci
        WHERE ci.is_active = true
          AND ci.category = 'daily'
    LOOP
        -- Cek apakah log untuk hari ini sudah ada
        SELECT EXISTS(
            SELECT 1 FROM public.checklist_logs
            WHERE user_id = rec.user_id
              AND item_id = rec.item_id
              AND log_date = target_date
        ) INTO log_exists;

        -- Insert log kosong (belum selesai) jika belum ada
        IF NOT log_exists THEN
            INSERT INTO public.checklist_logs (user_id, item_id, log_date, is_completed)
            VALUES (rec.user_id, rec.item_id, target_date, false);
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =============================================
-- 3. Function: Auto-update activity_logs score for today
--    Akan dihitung ulang setiap kali cron berjalan
-- =============================================
CREATE OR REPLACE FUNCTION public.update_daily_activity_score()
RETURNS void AS $$
DECLARE
    -- Gunakan timezone Jakarta agar sinkron dengan user WIB
    target_date DATE := (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Jakarta')::DATE;
    rec RECORD;
    v_completed_count INT;
    v_total_count INT;
    v_score INT;
    v_existing_log_id UUID;
BEGIN
    FOR rec IN
        SELECT DISTINCT user_id FROM public.checklist_items WHERE is_active = true
    LOOP
        -- Hitung total items aktif
        SELECT COUNT(*) INTO v_total_count
        FROM public.checklist_items
        WHERE user_id = rec.user_id AND is_active = true;

        -- Hitung yang sudah selesai hari ini
        SELECT COUNT(*) INTO v_completed_count
        FROM public.checklist_logs cl
        JOIN public.checklist_items ci ON cl.item_id = ci.id
        WHERE cl.user_id = rec.user_id
          AND cl.log_date = target_date
          AND cl.is_completed = true
          AND ci.is_active = true;

        -- Hitung score
        IF v_total_count > 0 THEN
            v_score := ROUND((v_completed_count::NUMERIC / v_total_count) * 100);
        ELSE
            v_score := 0;
        END IF;

        -- Upsert activity log
        SELECT id INTO v_existing_log_id
        FROM public.activity_logs
        WHERE user_id = rec.user_id AND log_date = target_date;

        IF v_existing_log_id IS NOT NULL THEN
            UPDATE public.activity_logs SET score = v_score WHERE id = v_existing_log_id;
        ELSE
            INSERT INTO public.activity_logs (user_id, log_date, score)
            VALUES (rec.user_id, target_date, v_score);
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =============================================
-- 4. Master function yang memanggil semua di atas berurutan
-- =============================================
CREATE OR REPLACE FUNCTION public.daily_midnight_routine()
RETURNS void AS $$
BEGIN
    -- Pastikan 5 item sholat ada
    PERFORM public.ensure_sholat_checklist_items();
    -- Generate log kosong untuk hari ini
    PERFORM public.generate_daily_checklist_logs();
    -- Update skor aktivitas
    PERFORM public.update_daily_activity_score();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =============================================
-- 5. Schedule Cron Job
--    Berjalan setiap hari jam 17:00 UTC = 00:00 WIB (UTC+7)
-- =============================================

-- Hapus schedule lama jika ada
SELECT cron.unschedule('daily-midnight-routine')
WHERE EXISTS (
    SELECT 1 FROM cron.job WHERE jobname = 'daily-midnight-routine'
);

-- Jadwalkan jam 17:00 UTC = 00:00 WIB
SELECT cron.schedule(
    'daily-midnight-routine',
    '0 17 * * *',
    'SELECT public.daily_midnight_routine()'
);


-- =============================================
-- 6. Jalankan sekali sekarang untuk set-up awal
-- =============================================
SELECT public.daily_midnight_routine();
