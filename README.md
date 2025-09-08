# Niro Map

Map visualizer of popular places — a small personal project for exploring points‑of‑interest data interactively. The project is open source and focused on fast map queries, simple UI, and exploring large POI datasets (≈12M places).

- Contact: niro.dev.01@gmail.com
- License: MIT

## Features

- Interactive map with fast POI markers and popups
- Filter by categories, country and confidence
- View place details and source metadata
- Place a pinned radius area (draw circle) to inspect nearby POIs

## Tech stack

- Frontend: SvelteKit, Tailwind CSS, shadcn-style UI primitives
- Map: Maplibre + @arenarium/maps
- Backend / DB: PostgreSQL + PostGIS
- Data: Overture places

## Contributing
If you plan to contribute or run the project locally, please contact me for instructions. The data nor db is not included in the repository as this was initially developed as a solo project.

## Support & Sponsorship

This is a personal project done for fun. If you'd like me to focus more time on it, consider supporting via Ko-fi: https://buymeacoffee.com/nirodev01n — even small contributions help prioritize maintenance and features.

## Notes

- This project is experimental, done as a weekend project; some features and code may be rough around edges.


## Todo

- [ ] Fix refetching on filter change