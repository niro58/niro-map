import dotenv
import psycopg2
import os 

lastMod = "2025-09-11"

pageIndex = 1

def main():
    global pageIndex
    maxOffset=11_500_000
    maxPerSitemap = 40_000
    pageLink="https://www.niromap.com/places/%s"
    offset = 0

    while offset < maxOffset:
        cursor = connection.cursor()
        print(f"Processing offset {offset}")
        cursor.execute("SELECT ogc_fid from public.places ORDER BY confidence desc LIMIT %s OFFSET %s", (maxPerSitemap, offset))

        pages = []
        for row in cursor.fetchall():
            try:
                placeId = row[0]
                pages.append(pageLink % str(placeId))
            except Exception as e:
                print(f"Error processing row {row}: {e}")
        
        print(f"  Found {len(pages)} pages")
        offset += maxPerSitemap

        with open(f"static/sitemaps/sitemap-{pageIndex}.xml", "w") as f:
            f.write('<?xml version="1.0" encoding="UTF-8"?>\n')
            f.write('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n')
            for page in pages:
                f.write("  <url>\n")
                f.write(f"    <loc>{page}</loc>\n")
                f.write(f"    <lastmod>{lastMod}</lastmod>\n")
                f.write("  </url>\n")
            f.write("</urlset>\n")
        pageIndex += 1

    with open("static/sitemap.xml", "w") as f:
        f.write('<?xml version="1.0" encoding="UTF-8"?>\n')
        f.write('<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n')
        for i in range(pageIndex):
            f.write("  <sitemap>\n")
            f.write(f"    <loc>https://www.niromap.com/sitemap-{i+1}.xml</loc>\n")
            f.write(f"    <lastmod>{lastMod}</lastmod>\n")
            f.write("  </sitemap>\n")
        f.write("</sitemapindex>\n")

    pass


dotenv.load_dotenv()
connection = psycopg2.connect(database=os.environ["DB_NAME"], user=os.environ["DB_USER"], password=os.environ["DB_PASS"], host=os.environ["DB_HOST"], port=os.environ["DB_PORT"])

main()