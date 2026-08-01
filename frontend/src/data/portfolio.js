/*
 * Single source of truth for portfolio content. Both the landing-page snippets and the full
 * detail pages read from here, so there's only ever one place to edit.
 *
 * NOTE: the copy below expands your existing section content into fuller detail-page material.
 * The short `description`/`tagline` fields feed the snippets; the longer `overview`, `highlights`,
 * and `sections` feed the dedicated pages — edit those freely.
 */

export const skills = [
    { name: 'Python', icon: '/Python.png' },
    { name: 'Flask', icon: '/flask.png' },
    { name: 'FastAPI', icon: '/fastapi.png' },
    { name: 'JavaScript', icon: '/javascript.webp' },
    { name: 'Next.js', icon: '/nextjs.png' },
    { name: 'React.js', icon: '/react.webp' },
    { name: 'Vue.js', icon: '/vue.webp' },
    { name: 'C++', icon: '/cpp.webp' },
    { name: 'PCB Design', icon: '/pcb.png' },
    { name: 'Docker', icon: '/docker.png' },
    { name: 'PostgreSQL', icon: '/postgres.png' },
    { name: 'AWS', icon: '/aws.webp' },
]

export const about = {
    // short blurb — used by the landing snippet
    blurb:
        "I'm a software engineer who spends the workday writing systems that need to be reliable, and the " +
        'weekend building things that need to fly. I care about clean architecture as much as clean solder ' +
        "joints — whether that means designing a scalable backend service or tuning a control loop on a " +
        "quadcopter's flight controller. Somewhere between the compiler and the workshop is where I do my best work.",
    // fuller bio — used by the /about page (one entry = one paragraph)
    bio: [
        "I'm a software engineer and mechatronics tinkerer. My day job is building reliable backend systems; " +
            'my off-hours go into machines that leave the ground — fixed-wing UAVs, flight controllers, and the ' +
            'telemetry tooling that keeps them honest.',
        'The two halves feed each other. Writing flight-control firmware taught me to respect latency and failure ' +
            'modes in a way that makes my web backends sturdier; building scalable services taught me to think about ' +
            'observability and clean interfaces in a way that makes my hardware projects debuggable.',
        'I like problems that sit at the seam between disciplines — where a control loop meets a database, or a PCB ' +
            "meets a deploy pipeline. If it needs both a compiler and a soldering iron, I'm interested.",
    ],
    focus: [
        { title: 'Backend & Systems', body: 'Event-driven services, APIs, data pipelines, and zero-downtime deploys.' },
        { title: 'UAV & Flight', body: 'Fixed-wing aerodynamics, flight-control firmware, and live telemetry.' },
        { title: 'Hardware & Mechatronics', body: 'PCB design, embedded control, and the messy bit where code meets copper.' },
    ],
}

export const experience = [
    {
        slug: 'bank-al-habib',
        title: 'Software Engineer Intern',
        org: 'Bank Al Habib, Pakistan',
        period: '2026',
        location: 'Karachi, PK',
        description:
            'Leading backend architecture for a fleet-management platform; migrated core services to an event-driven design, cutting p95 latency by 40%.',
        summary:
            'Worked across the backend of an internal fleet-management platform, owning the move from a synchronous ' +
            'request/response design to an event-driven architecture and the observability that came with it.',
        highlights: [
            'Migrated core services to an event-driven design, cutting p95 latency by ~40%.',
            'Introduced structured logging and tracing to make cross-service failures diagnosable.',
            'Hardened service boundaries with clearer contracts and validation.',
        ],
        stack: ['Quarkus', 'Vue 3', 'PostgreSQL', 'Microservices'],
    },
    {
        slug: 'cents',
        title: 'Lead Software Engineer',
        org: 'Cents',
        period: '2025 - 2026',
        location: 'Remote',
        description:
            'Built internal tooling for data pipelines and owned the migration of the deploy process to a fully containerized, zero-downtime pipeline.',
        summary:
            'Led internal tooling and platform work, with a focus on the data pipeline and the release process that ' +
            'shipped it.',
        highlights: [
            'Built internal tooling for data pipelines used across the team.',
            'Owned the migration to a fully containerized, zero-downtime deploy pipeline.',
            'Reduced release friction and rollback risk with reproducible builds.',
        ],
        stack: ['Docker', 'CI/CD', 'PostgreSQL', 'Node.js'],
    },
    {
        slug: 'ubc',
        title: 'Undergraduate Teaching Assistant',
        org: 'University of British Columbia',
        period: '2025',
        location: 'Vancouver, CA',
        description:
            'Developed flight-control firmware and telemetry tooling for a fixed-wing autonomous survey drone.',
        summary:
            'Supported coursework while building flight-control firmware and telemetry tooling for a fixed-wing ' +
            'autonomous survey drone.',
        highlights: [
            'Developed flight-control firmware for a fixed-wing autonomous survey drone.',
            'Built telemetry tooling to capture and visualize flight data.',
            'Mentored students through systems and embedded concepts.',
        ],
        stack: ['C++', 'Embedded', 'Telemetry'],
    },
]

export const projects = [
    {
        slug: 'openblue',
        name: 'OpenBlue',
        tagline: 'Live drone telemetry & mission planning',
        description: 'Autonomous drone telemetry and mission-planning dashboard with live MAVLink streaming.',
        year: '2025',
        role: 'Solo build',
        status: 'Active',
        tags: ['Vue', 'WebSockets', 'MAVLink', 'PostgreSQL'],
        links: { github: 'https://github.com/s-zainali', live: '' },
        overview:
            'OpenBlue is a ground-station dashboard for autonomous drones: it streams live MAVLink telemetry over ' +
            'WebSockets, plots the vehicle on a map in real time, and lets an operator lay out and upload a mission ' +
            'before flight. The goal was a browser-based station that felt as responsive as a native GCS.',
        highlights: [
            'Real-time MAVLink telemetry over a WebSocket bridge.',
            'Live map tracking with attitude and battery readouts.',
            'Waypoint mission planning with pre-flight upload.',
        ],
        sections: [
            {
                heading: 'The problem',
                body: 'Existing ground stations are heavy desktop apps. I wanted an operator to open a browser tab and be flying.',
            },
            {
                heading: 'How it works',
                body: 'A small bridge translates the MAVLink stream into WebSocket messages; the Vue frontend keeps a live vehicle model and renders it against a map, while mission plans are serialized and pushed back down the same channel.',
            },
        ],
    },
    {
        slug: 'soar',
        name: 'SOAR',
        tagline: 'Fixed-wing flying-wing UAV',
        description: 'A fixed-wing flying-wing UAV: full aerodynamic design, 3D-printed airframe, and flight tuning.',
        year: '2024',
        role: 'Design & build',
        status: 'Ongoing',
        tags: ['Aerodynamics', 'XFLR5', '3D Printing', 'Flight Control'],
        links: { github: 'https://github.com/s-zainali', live: '' },
        overview:
            'SOAR is a flying-wing UAV designed from the airfoil up: aerodynamic analysis and simulation, a 3D-printed ' +
            'airframe, and an iterative tune of CG, control surfaces, and flight behaviour through real test flights.',
        highlights: [
            'Airfoil selection and aerodynamic simulation (XFLR5).',
            'CG and static-margin calculation, elevon tuning.',
            '3D-printed airframe in lightweight PLA/PETG.',
        ],
        sections: [
            {
                heading: 'Design',
                body: 'The wing started as an airfoil study and a static-margin calculation, then moved into CAD and simulation before anything was printed.',
            },
            {
                heading: 'Build & tune',
                body: 'The airframe is 3D-printed and iterated: each crash fed back into geometry, CG, and control-surface throws until it flew the way the model predicted.',
            },
        ],
    },
    {
        slug: 'pool-manager',
        name: 'Pool Manager',
        tagline: 'Club management for a snooker hall',
        description: 'Table timing, billing, bookings, and role-based access for a snooker & pool club.',
        year: '2025',
        role: 'Solo build',
        status: 'Deployed',
        tags: ['Vue 3', 'Flask', 'JWT / RBAC', 'PWA'],
        links: { github: 'https://github.com/s-zainali', live: '' },
        overview:
            'A club-management app for a snooker and pool hall: it tracks table sessions and timing, computes billing, ' +
            'manages bookings and a queue, and gates everything behind role-based access for owner, manager, and ' +
            'receptionist. Installable as a PWA and deployed to production.',
        highlights: [
            'Live table timing and automatic billing.',
            'Booking and queue management.',
            'JWT auth with owner / manager / receptionist roles.',
            'Installable PWA, deployed on managed hosting.',
        ],
        sections: [
            {
                heading: 'Why',
                body: 'The hall ran on paper and mental math. The app turns table time into accurate, automatic bills and gives the owner a real view of the floor.',
            },
        ],
    },
    {
        slug: 'traders-hall',
        name: 'Traders Hall',
        tagline: 'Multiplayer online trading board game',
        description: 'A real-time multiplayer trading board game with bank loans, mortgages, and a live economy.',
        year: '2026',
        role: 'Solo build',
        status: 'In progress',
        tags: ['Vue 3', 'FastAPI', 'PostgreSQL', 'Realtime'],
        links: { github: 'https://github.com/s-zainali', live: '' },
        overview:
            'Traders Hall is a multiplayer online trading board game: players move around a live board, buy and trade ' +
            'assets, and take on bank loans and mortgages against an economy that updates in real time for everyone at ' +
            'the table.',
        highlights: [
            'Real-time multiplayer game state.',
            'Bank loans, mortgages, and default logic.',
            'Async FastAPI backend with PostgreSQL.',
        ],
        sections: [
            {
                heading: 'The systems',
                body: 'The interesting part is the economy: loans, mortgages, interest, and defaults all have to stay consistent across every connected player, which pushed the backend toward careful async state and migrations.',
            },
        ],
    },
]

export const contact = {
    email: 'szainali284@gmail.com',
    location: 'Karachi, Pakistan',
    availability: 'Open to interesting software, hardware, and UAV work.',
}

export const getProject = (slug) => projects.find((p) => p.slug === slug)