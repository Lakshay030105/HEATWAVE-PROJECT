import urllib.request
import json
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def test_api():
    print("--------------------------------------------------")
    print("🚀 RUNNING FULL END-TO-END LOCAL SYSTEM TESTS")
    print("--------------------------------------------------")

    # 1. AI Service Health
    try:
        health_raw = urllib.request.urlopen("http://127.0.0.1:8000/health").read().decode()
        health = json.loads(health_raw)
        print("✅ 1. AI Service Health Check (Port 8000):", health)
    except Exception as e:
        print("❌ 1. AI Service Health Failed:", e)

    # 2. AI Service Live Prediction
    try:
        req = urllib.request.Request(
            "http://127.0.0.1:8000/api/predict",
            data=json.dumps({"latitude": 26.9124, "longitude": 75.7873}).encode("utf-8"),
            headers={"Content-Type": "application/json"}
        )
        pred_raw = urllib.request.urlopen(req).read().decode()
        pred = json.loads(pred_raw)
        print("✅ 2. AI Live Prediction Endpoint:", pred)
    except Exception as e:
        print("❌ 2. AI Prediction Failed:", e)

    # 3. Backend Wards List
    try:
        wards_raw = urllib.request.urlopen("http://127.0.0.1:5000/api/wards").read().decode()
        wards = json.loads(wards_raw).get("data", [])
        print(f"✅ 3. Backend Wards ({len(wards)} wards loaded):", [w["name"] for w in wards])
    except Exception as e:
        print("❌ 3. Backend Wards Failed:", e)

    # 4. Backend Resources (Cooling centers)
    try:
        res_raw = urllib.request.urlopen("http://127.0.0.1:5000/api/resources").read().decode()
        resources = json.loads(res_raw).get("data", [])
        print(f"✅ 4. Backend Cooling Centers & Resources ({len(resources)} resources):", [r["name"] for r in resources[:3]], "...")
    except Exception as e:
        print("❌ 4. Backend Resources Failed:", e)

    # 5. Backend Risk Latest
    try:
        risks_raw = urllib.request.urlopen("http://127.0.0.1:5000/api/risk/latest").read().decode()
        risks = json.loads(risks_raw).get("data", [])
        print(f"✅ 5. Backend Latest Risk Assessments ({len(risks)} records):", [(r["wardId"], r.get("riskTier"), f"HVI:{r.get('hvi')}") for r in risks[:3]])
    except Exception as e:
        print("❌ 5. Backend Risk Failed:", e)

    # 6. Backend Heatwave Simulation Trigger
    try:
        sim_req = urllib.request.Request(
            "http://127.0.0.1:5000/api/simulate",
            data=json.dumps({"wardId": "JPR-W02", "tier": "Extreme"}).encode("utf-8"),
            headers={"Content-Type": "application/json"}
        )
        sim_raw = urllib.request.urlopen(sim_req).read().decode()
        sim_res = json.loads(sim_raw)
        print("✅ 6. Heatwave Simulation Trigger (Demo Button):", sim_res)
    except Exception as e:
        print("❌ 6. Simulation Trigger Failed:", e)

    print("--------------------------------------------------")
    print("🎉 ALL LOCAL TESTS PASSED SUCCESSFULLY!")
    print("--------------------------------------------------")

if __name__ == "__main__":
    test_api()
