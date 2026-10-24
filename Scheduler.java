package com.quraanustad.app;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;

import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Calendar;

/** Paanchon waqt ke exact alarm lagata hai (app band ho tab bhi bajte hain). */
final class Scheduler {

    static final String ACTION = "com.quraanustad.app.AZAN";

    private Scheduler() {}

    static int toMin(String hm) {
        try {
            String[] p = hm.split(":");
            int h = Integer.parseInt(p[0].trim());
            int m = Integer.parseInt(p[1].trim().substring(0, 2));
            if (h < 0 || h > 23 || m < 0 || m > 59) return -1;
            return h * 60 + m;
        } catch (Exception e) {
            return -1;
        }
    }

    static long nextTime(int minutes) {
        Calendar cal = Calendar.getInstance();
        cal.set(Calendar.HOUR_OF_DAY, minutes / 60);
        cal.set(Calendar.MINUTE, minutes % 60);
        cal.set(Calendar.SECOND, 0);
        cal.set(Calendar.MILLISECOND, 0);
        if (cal.getTimeInMillis() <= System.currentTimeMillis() + 2000) cal.add(Calendar.DAY_OF_YEAR, 1);
        return cal.getTimeInMillis();
    }

    private static PendingIntent alarmIntent(Context c, int i) {
        Intent in = new Intent(c, AlarmReceiver.class);
        in.setAction(ACTION);
        in.putExtra("i", i);
        return PendingIntent.getBroadcast(c, i, in, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
    }

    static void scheduleAll(Context c) {
        try {
            String ts = Prefs.sp(c).getString("times", null);
            if (ts == null) return;
            JSONObject o = new JSONObject(ts);
            AlarmManager am = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
            if (am == null) return;
            for (int i = 0; i < 5; i++) {
                PendingIntent pi = alarmIntent(c, i);
                int m = toMin(o.optString(Prefs.KEYS[i], ""));
                if (m < 0) {
                    am.cancel(pi);
                    continue;
                }
                Intent show = new Intent(c, MainActivity.class);
                PendingIntent showPi = PendingIntent.getActivity(c, 100 + i, show,
                        PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
                // setAlarmClock: sabse bharosemand — Doze mein bhi theek waqt par bajta hai
                am.setAlarmClock(new AlarmManager.AlarmClockInfo(nextTime(m), showPi), pi);
            }
        } catch (Exception ignored) {
        }
    }

    /** Kal ke waqt Aladhan se lo (sirf jab web app ne location di ho aur waqt khud se na bhare gaye hon). */
    static void refreshTimes(Context c) {
        refreshTimes(c, -1);
    }

    /** idx = jis namaz ka alarm abhi baja (sirf uska kal ka waqt badlo, baaki aaj ke hi rahein). -1 = sab. */
    static void refreshTimes(Context c, int idx) {
        try {
            SharedPreferences sp = Prefs.sp(c);
            if (!sp.getBoolean("auto", false) || !sp.contains("lat") || !sp.contains("lng")) return;
            Calendar t = Calendar.getInstance();
            t.add(Calendar.DAY_OF_YEAR, 1);
            String date = String.format("%02d-%02d-%04d", t.get(Calendar.DAY_OF_MONTH), t.get(Calendar.MONTH) + 1, t.get(Calendar.YEAR));
            String url = "https://api.aladhan.com/v1/timings/" + date + "?latitude=" + sp.getString("lat", "")
                    + "&longitude=" + sp.getString("lng", "") + "&school=" + sp.getString("school", "1");
            HttpURLConnection con = (HttpURLConnection) new URL(url).openConnection();
            con.setConnectTimeout(10000);
            con.setReadTimeout(10000);
            BufferedReader r = new BufferedReader(new InputStreamReader(con.getInputStream()));
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = r.readLine()) != null) sb.append(line);
            r.close();
            JSONObject timings = new JSONObject(sb.toString()).getJSONObject("data").getJSONObject("timings");
            JSONObject out = new JSONObject(sp.getString("times", "{}"));
            for (int n = 0; n < Prefs.KEYS.length; n++) {
                if (idx >= 0 && n != idx) continue;
                String k = Prefs.KEYS[n];
                out.put(k, timings.getString(k).substring(0, 5));
            }
            sp.edit().putString("times", out.toString()).apply();
        } catch (Exception ignored) {
        }
    }
}
