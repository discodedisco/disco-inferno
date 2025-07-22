import swisseph as swe

swe.set_ephe_path('../../libraries/swisseph-master')
jd = swe.julday(2000, 1, 1, 12)
print("Julian Day: ", jd)
pos, ret = swe.calc_ut(jd, swe.SUN)
print("Sun position: ", pos)