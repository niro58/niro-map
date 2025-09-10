import dotenv
import psycopg2
import os 

lastMod = "2025-09-10"

sitemaps = []



def main():
    maxOffset=1_500_000
    maxPerSitemap = 50_000
    page="https://www.niromap.com/places/%s"
    offset = 0

    while offset < maxOffset:
        cursor = connection.cursor()
        print(f"Processing offset {offset}")
        cursor.execute("SELECT ogc_fid from public.places ORDER BY confidence desc LIMIT %s OFFSET %s", (maxPerSitemap, offset))

        pages = []
        for row in cursor.fetchall():
            placeId = row[0]
            pages.append(page % placeId)

        
        print(f"  Found {len(pages)} pages")
        sitemaps.append(pages)
        offset += maxPerSitemap
    
    with open("static/sitemap.xml", "w") as f:
        f.write('<?xml version="1.0" encoding="UTF-8"?>\n')
        f.write('<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n')
        for i in range(len(sitemaps)):
            f.write("  <sitemap>\n")
            f.write(f"    <loc>https://www.niromap.com/sitemap-{i+1}.xml</loc>\n")
            f.write(f"    <lastmod>{lastMod}</lastmod>\n")
            f.write("  </sitemap>\n")
        f.write("</sitemapindex>\n")

    for i, pages in enumerate(sitemaps):
        with open(f"static/sitemap-{i+1}.xml", "w") as f:
            f.write('<?xml version="1.0" encoding="UTF-8"?>\n')
            f.write('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n')
            for page in pages:
                f.write("  <url>\n")
                f.write(f"    <loc>{page}</loc>\n")
                f.write(f"    <lastmod>{lastMod}</lastmod>\n")
                f.write("  </url>\n")
            f.write("</urlset>\n")
    pass


dotenv.load_dotenv()
connection = psycopg2.connect(database=os.environ["DB_NAME"], user=os.environ["DB_USER"], password=os.environ["DB_PASS"], host=os.environ["DB_HOST"], port=os.environ["DB_PORT"])

main()