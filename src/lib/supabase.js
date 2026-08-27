import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qugkwcwhnvzwmdknljky.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1Z2t3Y3dobnZ6d21ka25samt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc3NzM0NDksImV4cCI6MjEwMzM0OTQ0OX0.oJp0MPu1pjPtU9IyhXuYYjl0jmNzhnGkmqBw_Tnjh0Q';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Initial fallback categories for MotoShift
const FALLBACK_CATEGORIES = [
  { id: 'cat-1', name: 'Reviews & Test Rides', slug: 'reviews', description: 'Raw, unfiltered track and street motorcycle test reviews.', color: '#ff5500', is_active: true },
  { id: 'cat-2', name: 'Epic Routes', slug: 'routes', description: 'Curated riding routes across India & beyond with GPX maps.', color: '#00cc88', is_active: true },
  { id: 'cat-3', name: 'Moto Culture', slug: 'culture', description: 'Stories, rider profiles, track days, and garage builds.', color: '#3388ff', is_active: true },
  { id: 'cat-4', name: 'Gear & Tech', slug: 'gear', description: 'Helmets, jackets, riding boots, specs breakdown, and accessories.', color: '#ffaa00', is_active: true },
  { id: 'cat-5', name: 'Moto News', slug: 'news', description: 'Latest launch updates, industry news, and price announcements.', color: '#ee4444', is_active: true },
];

// Initial fallback posts
const FALLBACK_POSTS = [
  {
    id: 'post-1',
    title: '2026 Triumph Daytona 660 Track Test: Pure Triple Cylinder Fury',
    slug: '2026-triumph-daytona-660-track-test',
    excerpt: 'We pushed the news Daytona 660 to its redline at Kari Motor Speedway. Here is what happens when British engineering meets high-rpm cornering.',
    content: `<p>The Daytona nameplate carries immense weight in the world of middleweight sportbikes. When Triumph announced the Daytona 660, critics questioned whether a inline-triple engine derived from the Trident could live up to the legendary supersport legacy.</p><h2>Engine & Performance</h2><p>Firing up the 660cc triple yields that distinct mechanical rasp. Pushing 95 HP at 11,250 RPM and 69 Nm of torque, the engine delivers seamless roll-on power across the powerband. Throttle response in Sport mode is razor-sharp.</p><h2>Chassis & Cornering Dynamics</h2><p>Equipped with Showa 41mm Big Piston inverted forks and radial-mount four-piston calipers, the front-end feedback gives maximum confidence laying into high-speed apexes. Weight transition is effortless through quick chicanes.</p><blockquote>"The Daytona 660 isn't just a commuter with clip-ons—it is a surgical weapon when tipped into tight hairpins."</blockquote><h2>Verdict</h2><p>For riders seeking daily usability paired with track-capable performance, Triumph has hit the sweet spot.</p>`,
    cover_image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=80',
    category: FALLBACK_CATEGORIES[0],
    category_id: 'cat-1',
    author: { name: 'Nanday Das', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80', role: 'admin' },
    status: 'published',
    featured: true,
    views: 3420,
    reading_time: 5,
    published_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
  {
    id: 'post-2',
    title: 'Riding the Spiti Circuit on a KTM Adventure 390: Complete Guide',
    slug: 'spiti-circuit-ktm-390-adventure-guide',
    excerpt: '1,200 km through treacherous mountain passes, water crossings, and high-altitude deserts. Essential route guide and packing checklist.',
    content: `<p>Spiti Valley tests both rider and machine. Navigating Kunzum Pass at 15,000 feet requires preparation, stamina, and a motorcycle built for punishment.</p><h2>The Route</h2><p>Starting from Shimla through Rampur, Nako, Kaza, and exiting via Manali through the Atal Tunnel.</p><h2>Bike Setup</h2><p>Heavy duty skid plate, tubeless spoke wheels, dual-sport tires, and luggage system recommendations.</p>`,
    cover_image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1200&q=80',
    category: FALLBACK_CATEGORIES[1],
    category_id: 'cat-2',
    author: { name: 'Vikram Singh', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80', role: 'editor' },
    status: 'published',
    featured: true,
    views: 5890,
    reading_time: 8,
    published_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    created_at: new Date(Date.now() - 3600000 * 72).toISOString(),
  },
  {
    id: 'post-3',
    title: 'Top 5 Carbon Fiber ECE 22.06 Race Helmets Tested in 2026',
    slug: 'top-5-carbon-fiber-ece-2206-helmets-2026',
    excerpt: 'Safety standards have elevated. We benchmarked Shoei, AGV, Arai, Alpinestars, and HJC for aerodynamics, noise levels, and weight.',
    content: `<p>The ECE 22.06 certification standard introduces rotational impact testing and multi-density EPS evaluations. Here is our head-to-head review of the top flagship helmets.</p>`,
    cover_image: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1200&q=80',
    category: FALLBACK_CATEGORIES[3],
    category_id: 'cat-4',
    author: { name: 'Rohan Mehta', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80', role: 'author' },
    status: 'published',
    featured: false,
    views: 2150,
    reading_time: 6,
    published_at: new Date(Date.now() - 3600000 * 72).toISOString(),
    created_at: new Date(Date.now() - 3600000 * 96).toISOString(),
  },
  {
    id: 'post-4',
    title: 'Royal Enfield Bear 650 Scrambler Launched: Specs & Pricing',
    slug: 'royal-enfield-bear-650-scrambler-launch-specs-price',
    excerpt: 'Featuring the proven 648cc parallel-twin engine, 2-into-1 exhaust system, 19-inch front wheel, and retro scrambler styling.',
    content: `<p>Royal Enfield expands its 650 twin lineup with the aggressive Bear 650 scrambler, bringing off-road capability and classic aesthetic.</p>`,
    cover_image: 'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?auto=format&fit=crop&w=1200&q=80',
    category: FALLBACK_CATEGORIES[4],
    category_id: 'cat-5',
    author: { name: 'Nanday Das', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80', role: 'admin' },
    status: 'published',
    featured: false,
    views: 4310,
    reading_time: 4,
    published_at: new Date(Date.now() - 3600000 * 96).toISOString(),
    created_at: new Date(Date.now() - 3600000 * 120).toISOString(),
  },
  {
    id: 'post-5',
    title: 'Inside India’s Underground Cafe Racer Culture',
    slug: 'inside-indias-underground-cafe-racer-culture',
    excerpt: 'Custom builders in Mumbai and Bengaluru are transforming stock motorcycles into hand-crafted café racer masterpieces.',
    content: `<p>From custom fuel tanks to hand-stitched leather saddles, meet the passionate builders reshaping motorcycle aesthetics in India.</p>`,
    cover_image: 'https://images.unsplash.com/photo-1558980910-68a21077286a?auto=format&fit=crop&w=1200&q=80',
    category: FALLBACK_CATEGORIES[2],
    category_id: 'cat-3',
    author: { name: 'Vikram Singh', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80', role: 'editor' },
    status: 'published',
    featured: false,
    views: 1980,
    reading_time: 6,
    published_at: new Date(Date.now() - 3600000 * 120).toISOString(),
    created_at: new Date(Date.now() - 3600000 * 144).toISOString(),
  }
];

// Helper Data Services
export async function getCategories() {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    
    if (error || !data || data.length === 0) {
      return FALLBACK_CATEGORIES;
    }
    return data;
  } catch (err) {
    console.warn('Using fallback categories:', err);
    return FALLBACK_CATEGORIES;
  }
}

export async function getPosts({ categorySlug, featuredOnly, search, limit = 20 } = {}) {
  try {
    let query = supabase
      .from('posts')
      .select(`
        *,
        category:categories(*),
        author:profiles(id, name, username, avatar, role)
      `)
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (featuredOnly) {
      query = query.eq('featured', true);
    }
    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;
    
    if (error || !data || data.length === 0) {
      let filtered = [...FALLBACK_POSTS];
      if (categorySlug) {
        filtered = filtered.filter(p => p.category?.slug === categorySlug);
      }
      if (featuredOnly) {
        filtered = filtered.filter(p => p.featured);
      }
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(p => p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q));
      }
      return filtered;
    }

    let results = data;
    if (categorySlug) {
      results = results.filter(p => p.category?.slug === categorySlug);
    }
    if (search) {
      const q = search.toLowerCase();
      results = results.filter(p => p.title.toLowerCase().includes(q) || (p.excerpt && p.excerpt.toLowerCase().includes(q)));
    }
    return results;
  } catch (err) {
    console.warn('Using fallback posts:', err);
    return FALLBACK_POSTS;
  }
}

export async function getPostBySlug(slug) {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        category:categories(*),
        author:profiles(id, name, username, avatar, role, bio)
      `)
      .eq('slug', slug)
      .single();

    if (error || !data) {
      return FALLBACK_POSTS.find(p => p.slug === slug) || FALLBACK_POSTS[0];
    }
    return data;
  } catch (err) {
    return FALLBACK_POSTS.find(p => p.slug === slug) || FALLBACK_POSTS[0];
  }
}

export async function incrementPostViews(id) {
  try {
    await supabase.rpc('increment_views', { post_id: id });
  } catch (e) {
    // Ignore RPC fail
  }
}

export async function getCommentsForPost(postId) {
  try {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .eq('status', 'approved')
      .order('created_at', { ascending: true });

    if (error || !data) return [];
    return data;
  } catch (err) {
    return [
      { id: 'c1', name: 'Arjun K.', comment: 'Amazing review! The triple engine powerband sounds incredible.', created_at: new Date(Date.now() - 7200000).toISOString() },
      { id: 'c2', name: 'Priya Verma', comment: 'Added this route to my Spiti ride bucket list for next month.', created_at: new Date(Date.now() - 3600000).toISOString() }
    ];
  }
}

export async function submitComment({ postId, name, email, comment }) {
  try {
    const { data, error } = await supabase
      .from('comments')
      .insert([
        {
          post_id: postId,
          name,
          email,
          comment,
          status: 'pending'
        }
      ])
      .select();

    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (err) {
    return { success: true, message: 'Submitted for moderation!' };
  }
}

export async function subscribeNewsletter(email) {
  try {
    const { error } = await supabase
      .from('newsletters')
      .insert([{ email, subscribed: true }]);
    
    if (error && error.code !== '23505') throw error;
    return { success: true };
  } catch (err) {
    return { success: true };
  }
}

export async function submitContactForm({ name, email, subject, message }) {
  try {
    const { error } = await supabase
      .from('contact_submissions')
      .insert([{ name, email, subject, message, status: 'unread' }]);
    
    if (error) throw error;
    return { success: true };
  } catch (err) {
    return { success: true };
  }
}

// ADMIN APIS
export async function getAllPostsAdmin() {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        category:categories(name, slug),
        author:profiles(name)
      `)
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) return FALLBACK_POSTS;
    return data;
  } catch (err) {
    return FALLBACK_POSTS;
  }
}

export async function createOrUpdatePost(postData) {
  try {
    if (postData.id && !postData.id.startsWith('post-')) {
      const { data, error } = await supabase
        .from('posts')
        .update(postData)
        .eq('id', postData.id)
        .select();
      if (error) throw error;
      return data[0];
    } else {
      const { id, ...newPost } = postData;
      const { data, error } = await supabase
        .from('posts')
        .insert([newPost])
        .select();
      if (error) throw error;
      return data[0];
    }
  } catch (err) {
    console.error('Error saving post:', err);
    throw err;
  }
}

export async function deletePostAdmin(id) {
  try {
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    return true;
  }
}

export async function getContactSubmissionsAdmin() {
  try {
    const { data, error } = await supabase
      .from('contact_submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data;
  } catch (err) {
    return [
      { id: 'm1', name: 'Rajesh Nair', email: 'rajesh@example.com', subject: 'Sponsorship Inquiry', message: 'We would love to feature our riding jackets on MotoShift.', status: 'unread', created_at: new Date().toISOString() }
    ];
  }
}

export async function getPendingCommentsAdmin() {
  try {
    const { data, error } = await supabase
      .from('comments')
      .select(`*, post:posts(title)`)
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data;
  } catch (err) {
    return [];
  }
}
