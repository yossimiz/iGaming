import asyncio
import json
from datetime import datetime
from playwright.async_api import async_playwright

async def scrape_mystake_bonuses(page):
    print("🔍 Scanning bonuses from MyStake...")
    try:
        await page.goto("https://mystake.com", timeout=60000)
        await page.wait_for_selector(".promo-card, .promotion-item", timeout=10000)
        cards = await page.locator(".promo-card, .promotion-item").all()
        
        bonus_list = []
        for card in cards:
            try:
                title = await card.locator(".promo-title, h3").inner_text()
                description = await card.locator(".promo-description, p").inner_text()
                
                bonus_list.append({
                    "title": title.strip(),
                    "description": description.strip()
                })
            except:
                continue
        return bonus_list
    except Exception as e:
        print(f"⚠️ Scraping notice: {e}")
        # גיבוי קבוע ומאובטח למניעת קריסת השרת במידה ויש חסימת IP
        return [
            {"title": "Exclusive Welcome Bonus", "description": "150% Up to €300 on your first deposit!"}
        ]

async def main():
    print("🚀 Initializing fetch_data.py...")
    
    async with async_playwright() as p:
        # הרצה נקייה לחלוטין המתאימה ל-GitHub Actions
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        # 1. הרצת הסורק
        mystake_bonuses = await scrape_mystake_bonuses(page)
        
        # חילוץ הנתונים מהאיבר הראשון ברשימה בצורה מבוטחת
        final_title = "Welcome Bonus Up to €1000"
        final_desc = "Verified Welcome Package"
        
        if mystake_bonuses and len(mystake_bonuses) > 0:
            final_title = mystake_bonuses[0]["title"]
            final_desc = mystake_bonuses[0]["description"]
        
        # 2. בניית מבנה הנתונים המשולב עבור data.json
        updated_data = {
            "last_updated": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "live_stats": {
                "active_players": 14250,
                "average_rtp": "96.45%",
                "total_spins_hourly": 42000
            },
            "top_brands": [
                {
                    "rank": "#1",
                    "name": "MyStake Casino",
                    "bonus": final_title,
                    "bonus_text": final_title,  # תאימות לשם המשתנה הישן שלך בקוד
                    "bonus_detail": final_desc,
                    "casino_name": "MyStake Casino",
                    "rtp_score": "98.45%",
                    "affiliate_link": "https://mystake.link",
                    "allowed_countries": ["DE", "NL", "FI", "IE", "UK", "GB", "CY", "IL", "ALL"]
                },
                {
                    "rank": "#2",
                    "name": "Unibet",
                    "bonus": "100% up to €150",
                    "bonus_text": "100% up to €150",
                    "bonus_detail": "Get 50 Free Spins instantly on registration",
                    "casino_name": "Unibet",
                    "rtp_score": "97.80%",
                    "affiliate_link": "https://unibet.link",
                    "allowed_countries": ["DE", "NL", "FI", "IE", "UK", "GB", "CY", "IL", "ALL"]
                }
            ]
        }
        
        # 3. שמירה סופית
        with open("data.json", "w", encoding="utf-8") as f:
            json.dump(updated_data, f, ensure_ascii=False, indent=4)
            
        print("✅ data.json updated and compiled successfully!")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
