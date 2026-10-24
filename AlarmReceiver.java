package com.quraanustad.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;

public class AlarmReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(final Context c, Intent in) {
        int i = in.getIntExtra("i", 0);
        SharedPreferences sp = Prefs.sp(c);
        boolean lock = sp.getBoolean("lock", true) && AdminReceiver.isActive(c);
        boolean sound = !"off".equals(sp.getString("sound", "aksa"));

        if (sound || lock) {
            Intent s = new Intent(c, AzanService.class);
            s.putExtra("i", i);
            c.startForegroundService(s);
        }

        Scheduler.scheduleAll(c);                 // agla alarm foran lagao
        final PendingResult pr = goAsync();
        new Thread(new Runnable() {
            @Override
            public void run() {
                try {
                    Scheduler.refreshTimes(c, i); // is namaz ka kal ka sahi waqt
                    Scheduler.scheduleAll(c);
                } finally {
                    pr.finish();
                }
            }
        }).start();
    }
}
