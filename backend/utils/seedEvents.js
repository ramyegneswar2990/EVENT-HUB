const Event = require('../models/Event');
const User = require('../models/User');

// Map human-friendly categories to internal enum values
// Allowed values: 'concert', 'conference', 'workshop', 'sports', 'theater', 'other'
const mapCategory = (category) => {
  if (!category) return 'other';
  const c = category.toLowerCase();

  if (c.includes('sport') || c.includes('marathon')) return 'sports';
  if (c.includes('business') || c.includes('webinar') || c.includes('corporate')) {
    return 'conference';
  }

  // Everything else we keep as 'other'
  return 'other';
};

// Predefined sample events
const sampleEvents = [
  {
    title: 'Food Fiesta Festival',
    categoryLabel: 'Festival',
    description: 'A food festival featuring cuisines from around the world.',
    date: '2025-12-15',
    time: '11:00 AM',
    venue: 'Central Park Grounds',
    location: 'Mumbai, India',
    price: 10,
    totalTickets: 2000,
    availableTickets: 1320,
    image:
      'https://images.unsplash.com/photo-1521305916504-4a1121188589?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'City Marathon 2025',
    categoryLabel: 'Sports Event',
    description: 'Annual marathon open to all fitness levels.',
    date: '2026-02-22',
    time: '06:00 AM',
    venue: 'City Stadium',
    location: 'Delhi, India',
    price: 25,
    totalTickets: 3000,
    availableTickets: 2180,
    image:
      'https://images.unsplash.com/photo-1520975918313-6c2c1c6e7c52?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Art & Culture Expo',
    categoryLabel: 'Exhibition',
    description: 'A showcase of modern and traditional artwork.',
    date: '2026-03-02',
    time: '10:30 AM',
    venue: 'National Art Gallery',
    location: 'Kolkata, India',
    price: 15,
    totalTickets: 600,
    availableTickets: 420,
    image:
      'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Global Business Webinar',
    categoryLabel: 'Webinar',
    description: 'Online business strategies webinar hosted by experts.',
    date: '2025-12-18',
    time: '04:00 PM',
    venue: 'Online (Zoom)',
    location: 'Virtual',
    price: 20,
    totalTickets: 1000,
    availableTickets: 750,
    image:
      'https://images.unsplash.com/photo-1587614382346-4ec72b3a2b06?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Corporate Product Launch',
    categoryLabel: 'Corporate Event',
    description: 'Launch of a new tech product with live demonstrations.',
    date: '2026-01-10',
    time: '02:00 PM',
    venue: 'Skyline Convention Center',
    location: 'Pune, India',
    price: 0,
    totalTickets: 400,
    availableTickets: 270,
    image:
      'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Charity Fundraising Gala',
    categoryLabel: 'Charity Event',
    description: 'A charity dinner to raise funds for community welfare.',
    date: '2025-12-28',
    time: '08:00 PM',
    venue: 'Royal Banquet Hall',
    location: 'Hyderabad, India',
    price: 75,
    totalTickets: 250,
    availableTickets: 130,
    image:
      'https://images.unsplash.com/photo-1524233620809-1c7a1a71a2c9?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Wedding & Celebration Expo',
    categoryLabel: 'Social Event',
    description:
      'An expo showcasing wedding planners, decorators, and celebration vendors.',
    date: '2026-02-14',
    time: '12:00 PM',
    venue: 'Grand Palace Exhibition Center',
    location: 'Ahmedabad, India',
    price: 12,
    totalTickets: 1000,
    availableTickets: 690,
    image:
      'https://images.unsplash.com/photo-1521302080334-4bebac27605e?auto=format&fit=crop&w=1200&q=80',
  },
];

const seedEvents = async () => {
  try {
    // Find admin user to set as createdBy
    const admin = await User.findOne({ email: 'admin@gmail.com' });

    if (!admin) {
      console.log(
        '⚠️ No admin user found (admin@gmail.com). Skipping event seeding.'
      );
      return;
    }

    for (const ev of sampleEvents) {
      // Avoid duplicates by title
      const existing = await Event.findOne({ title: ev.title });
      if (existing) {
        continue;
      }

      await Event.create({
        title: ev.title,
        description: `${ev.description} (Category: ${ev.categoryLabel})`,
        category: mapCategory(ev.categoryLabel),
        date: new Date(ev.date),
        time: ev.time,
        venue: ev.venue,
        location: ev.location,
        price: ev.price,
        totalTickets: ev.totalTickets,
        availableTickets: ev.availableTickets,
        image: ev.image,
        createdBy: admin._id,
      });
    }

    console.log('✓ Sample events seeded successfully');
  } catch (error) {
    console.error('Error seeding events:', error.message);
  }
};

module.exports = seedEvents;


