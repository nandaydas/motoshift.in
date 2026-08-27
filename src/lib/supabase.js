import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qugkwcwhnvzwmdknljky.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1Z2t3Y3dobnZ6d21ka25samt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc3NzM0NDksImV4cCI6MjEwMzM0OTQ0OX0.oJp0MPu1pjPtU9IyhXuYYjl0jmNzhnGkmqBw_Tnjh0Q';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ==================== AUTH SERVICES ====================

export async function signInUser({ email, password }) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    
    // Fetch profile role from profiles table
    let role = 'author';
    let name = email.split('@')[0];
    let avatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';

    if (data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profile) {
        role = profile.role || 'author';
        name = profile.name || name;
        avatar = profile.avatar || avatar;
      }
    }

    return {
      user: {
        id: data.user.id,
        email: data.user.email,
        name,
        role,
        avatar
      }
    };
  } catch (err) {
    console.error('Error signing in:', err);
    throw err;
  }
}

export async function signUpUser({ email, password, name, username }) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, username }
      }
    });
    if (error) throw error;

    if (data.user) {
      // Create profile row in profiles table
      await supabase.from('profiles').insert([
        {
          id: data.user.id,
          name: name || email.split('@')[0],
          username: username || email.split('@')[0],
          email: data.user.email,
          role: 'author',
          is_approved: true
        }
      ]);
    }

    return {
      user: {
        id: data.user?.id,
        email: data.user?.email,
        name: name || email.split('@')[0],
        role: 'author',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
      }
    };
  } catch (err) {
    console.error('Error signing up:', err);
    throw err;
  }
}

// ==================== PUBLIC PORTAL SERVICES ====================

export async function getCategories() {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    
    if (error) {
      console.error('Error fetching categories from Supabase:', error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error('Error in getCategories:', err);
    return [];
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
    
    if (error) {
      console.error('Error fetching posts from Supabase:', error);
      return [];
    }

    let results = data || [];
    if (categorySlug) {
      results = results.filter(p => p.category?.slug === categorySlug);
    }
    if (search) {
      const q = search.toLowerCase();
      results = results.filter(p => p.title.toLowerCase().includes(q) || (p.excerpt && p.excerpt.toLowerCase().includes(q)));
    }
    return results;
  } catch (err) {
    console.error('Error in getPosts:', err);
    return [];
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

    if (error) {
      console.error(`Error fetching post by slug "${slug}":`, error);
      return null;
    }
    return data;
  } catch (err) {
    console.error('Error in getPostBySlug:', err);
    return null;
  }
}

export async function incrementPostViews(id) {
  try {
    const { data } = await supabase.from('posts').select('views').eq('id', id).single();
    if (data) {
      await supabase.from('posts').update({ views: (data.views || 0) + 1 }).eq('id', id);
    }
  } catch (e) {
    // view increment failed
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

    if (error) return [];
    return data || [];
  } catch (err) {
    return [];
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
    console.error('Error submitting comment:', err);
    throw err;
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
    console.error('Error subscribing to newsletter:', err);
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
    console.error('Error submitting contact form:', err);
    throw err;
  }
}

// ==================== ADMIN SERVICES ====================

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

    if (error) {
      console.error('Error fetching admin posts:', error);
      return [];
    }
    return data || [];
  } catch (err) {
    return [];
  }
}

export async function createOrUpdatePost(postData) {
  try {
    const cleanData = { ...postData };
    
    // Remove relation objects if present
    delete cleanData.category;
    delete cleanData.author;

    // Sanitize id field
    if (!cleanData.id || typeof cleanData.id !== 'string' || cleanData.id.trim() === '' || cleanData.id.length !== 36) {
      delete cleanData.id;
    }

    // Sanitize category_id field
    if (!cleanData.category_id || typeof cleanData.category_id !== 'string' || cleanData.category_id.trim() === '' || cleanData.category_id.length !== 36) {
      cleanData.category_id = null;
    }

    // Sanitize author_id field
    if (!cleanData.author_id || typeof cleanData.author_id !== 'string' || cleanData.author_id.trim() === '' || cleanData.author_id.length !== 36) {
      const { data: firstProfile } = await supabase.from('profiles').select('id').limit(1).maybeSingle();
      if (firstProfile?.id) {
        cleanData.author_id = firstProfile.id;
      } else {
        delete cleanData.author_id;
      }
    }

    if (postData.id && typeof postData.id === 'string' && postData.id.length === 36) {
      const { data, error } = await supabase
        .from('posts')
        .update(cleanData)
        .eq('id', postData.id)
        .select();
      if (error) throw error;
      return data[0];
    } else {
      const { data, error } = await supabase
        .from('posts')
        .insert([cleanData])
        .select();
      if (error) throw error;
      return data[0];
    }
  } catch (err) {
    console.error('Error saving post to Supabase:', err);
    throw err;
  }
}

export async function deletePostAdmin(id) {
  try {
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error deleting post:', err);
    throw err;
  }
}

export async function getContactSubmissionsAdmin() {
  try {
    const { data, error } = await supabase
      .from('contact_submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return [];
    return data || [];
  } catch (err) {
    return [];
  }
}

export async function updateContactStatusAdmin(id, status) {
  try {
    const { error } = await supabase
      .from('contact_submissions')
      .update({ status })
      .eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    return false;
  }
}

export async function getPendingCommentsAdmin() {
  try {
    const { data, error } = await supabase
      .from('comments')
      .select(`*, post:posts(title)`)
      .order('created_at', { ascending: false });

    if (error) return [];
    return data || [];
  } catch (err) {
    return [];
  }
}

export async function updateCommentStatusAdmin(id, status) {
  try {
    const { error } = await supabase
      .from('comments')
      .update({ status })
      .eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    return false;
  }
}

export async function deleteCommentAdmin(id) {
  try {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    return false;
  }
}

export async function getMediaAdmin() {
  try {
    const { data, error } = await supabase
      .from('media')
      .select('*')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    if (error) return [];
    return data || [];
  } catch (err) {
    return [];
  }
}

export async function uploadMediaAdmin(file, userId = null) {
  try {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'nanday';
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ml_default';

    let publicUrl = '';
    let publicId = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    let width = null;
    let height = null;
    let bytes = file.size || 0;
    let format = file.name.split('.').pop() || 'jpg';

    // 1. Upload file to Cloudinary REST API endpoint
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const cloudData = await res.json();
        publicUrl = cloudData.secure_url || cloudData.url;
        publicId = cloudData.public_id || publicId;
        width = cloudData.width || null;
        height = cloudData.height || null;
        bytes = cloudData.bytes || bytes;
        format = cloudData.format || format;
      } else {
        const errText = await res.text();
        console.warn('Cloudinary upload response not OK:', errText);
      }
    } catch (cloudErr) {
      console.warn('Cloudinary network upload error:', cloudErr);
    }

    // Fallback preview URL if Cloudinary URL not generated
    if (!publicUrl) {
      publicUrl = URL.createObjectURL(file);
    }

    // 2. Prepare metadata record for Supabase media table
    const mediaRecord = {
      filename: publicId,
      original_filename: file.name,
      storage_path: `cloudinary://${publicId}`,
      public_url: publicUrl,
      mime_type: file.type || `image/${format}`,
      extension: format,
      size: bytes,
      width: width,
      height: height,
      uploaded_by: (userId && typeof userId === 'string' && userId.length === 36) ? userId : null,
      is_deleted: false
    };

    // 3. Save uploaded image record in Supabase `media` table
    const { data, error } = await supabase
      .from('media')
      .insert([mediaRecord])
      .select();

    if (error) {
      console.error('Error recording media metadata in Supabase:', error);
      return mediaRecord;
    }

    return data[0];
  } catch (err) {
    console.error('Media upload service error:', err);
    throw err;
  }
}
