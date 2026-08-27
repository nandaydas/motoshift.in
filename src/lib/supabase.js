import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qugkwcwhnvzwmdknljky.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1Z2t3Y3dobnZ6d21ka25samt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc3NzM0NDksImV4cCI6MjEwMzM0OTQ0OX0.oJp0MPu1pjPtU9IyhXuYYjl0jmNzhnGkmqBw_Tnjh0Q';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
    if (postData.id) {
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

export async function uploadMediaAdmin(file) {
  try {
    const filename = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('media')
      .upload(filename, file);

    if (uploadError) {
      console.warn('Storage upload error, saving metadata:', uploadError);
    }

    const { data: publicUrlData } = supabase.storage.from('media').getPublicUrl(filename);
    const publicUrl = publicUrlData?.publicUrl || URL.createObjectURL(file);

    const mediaRecord = {
      filename,
      original_filename: file.name,
      storage_path: uploadData?.path || filename,
      public_url: publicUrl,
      mime_type: file.type || 'image/jpeg',
      extension: file.name.split('.').pop(),
      size: file.size || 0,
    };

    const { data, error } = await supabase.from('media').insert([mediaRecord]).select();
    if (error) throw error;
    return data[0];
  } catch (err) {
    console.error('Media upload error:', err);
    throw err;
  }
}
