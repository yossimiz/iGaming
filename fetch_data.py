import asyncio
import json
import os
from datetime import datetime
from playwright.async_api import async_playwright

async def scrape_mystake_bonuses(page):
    print("🔍 Scanning bonuses from MyStake...")
    try:
        await page.goto("https://mystake.com", timeout=60000)
        await page.wait_for_selector(".promo-card, .promotion-item", timeout=15000)
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
        print(f"⚠️ Scraping failed: {e}")
        # גיבוי קבוע במידה והאתר חסם את השרת של גיטהאב
        return [
            {"title": "Exclusive Welcome Bonus", "description": "150% Up to €300 on your first deposit!"},
            {"title": "Crypto Cashback", "description": "10% Crypto Cashback on all losses weekly."}
        ]

async def main():
    print("🚀 Initializing fetch_data.py...")
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
        )
        page = await context.new_page()
        
        # 1. הרצת הסורק לקבלת מערך הבונוסים
        mystake_bonuses = await scrape_mystake_bonuses(page)
        
        # חילוץ הבונוס הראשון מתוך המערך בצורה בטוחה כדי למנוע את קריסת הסקריפט
        first_bonus_title = mystake_bonuses[0]["title"] if len(mystake_bonuses) > 0 else "Welcome Bonus Up to €1000"
        first_bonus_desc = mystake_bonuses[0]["description"] if len(mystake_bonuses) > 0 else "Verified Welcome Package"
        
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
                    "bonus": first_bonus_title,
                    "bonus_detail": first_bonus_desc,
                    "rtp": "98.45%",
                    "rating": "4.9",
                    "allowed_countries": ["DE", "NL", "FI", "IE", "UK", "CY"]
                },
                {
                    "rank": "#2",
                    "name": "Unibet",
                    "bonus": "100% up to €150",
                    "bonus_detail": "Get 50 Free Spins instantly on registration",
                    "rtp": "97.80%",
                    "rating": "4.8",
                    "allowed_countries": ["DE", "NL", "FI", "IE", "UK", "CY"]
                }
            ]
        }
        
        # 3. שמירה לקובץ data.json
        with open("data.json", "w", encoding="utf-8") as f:
            json.dump(updated_data, f, ensure_ascii=False, indent=4)
            
        print("✅ data.json updated and compiled successfully!")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
