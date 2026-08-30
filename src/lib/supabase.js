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

    logActivity({
      action: 'USER_SIGNED_IN',
      entity_type: 'user',
      entity_id: data.user?.id,
      description: `User "${name}" (${email}) signed in to MotoShift`,
      actor_name: name,
      actor_email: email
    });

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

export async function signOutUser(user) {
  try {
    await supabase.auth.signOut();
    logActivity({
      action: 'USER_SIGNED_OUT',
      entity_type: 'user',
      entity_id: user?.id,
      description: `User "${user?.name || user?.email || 'User'}" signed out`,
      actor_name: user?.name || 'User',
      actor_email: user?.email
    });
  } catch (err) {
    console.error('Error signing out:', err);
  }
}

export async function updateUserProfile(userId, data) {
  try {
    const payload = {
      name: data.name,
      username: data.username,
      avatar: data.avatar,
      bio: data.bio,
      updated_at: new Date().toISOString()
    };

    const { data: updated, error } = await supabase
      .from('profiles')
      .update(payload)
      .eq('id', userId)
      .select('*');

    if (error) {
      console.error('Error updating profile in Supabase:', error);
    }
    return (updated && updated[0]) ? updated[0] : data;
  } catch (err) {
    console.error('Error in updateUserProfile:', err);
    return data;
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

export async function resetPassword({ email }) {
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error sending password reset email:', err);
    throw err;
  }
}

export async function updatePassword({ password }) {
  try {
    const { data, error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error updating password:', err);
    throw err;
  }
}

// ==================== SUPABASE EDGE ANALYTICS SERVICE ====================

export async function getEdgeAnalyticsData() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token || 'sb_publishable_v3fezo9RVI75FyozbavCbQ_z6zCEHR-';

    const res = await fetch('https://qugkwcwhnvzwmdknljky.supabase.co/functions/v1/fetch-google-analytics', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': 'sb_publishable_v3fezo9RVI75FyozbavCbQ_z6zCEHR-',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: 'Functions' })
    });

    const data = await res.json();

    if (res.ok && data && !data.error) {
      const totals = data.totals || {};
      const activeUsers = totals.activeUsers || 0;
      const sessions = totals.sessions || 0;
      const pageViews = totals.pageViews || 0;
      
      const avgSec = totals.avgSessionDuration || 0;
      const avgDuration = `${Math.floor(avgSec / 60)}m ${Math.round(avgSec % 60)}s`;
      const avgReadingTimeMin = Math.max(1, Math.round(avgSec / 60));

      const bounceVal = totals.bounceRate || 0;
      const bounceRate = typeof bounceVal === 'number' ? `${(bounceVal * (bounceVal > 1 ? 1 : 100)).toFixed(1)}%` : '0%';

      const topPages = Array.isArray(data.topPages) ? data.topPages : [];

      return {
        source: 'Supabase Edge Analytics API',
        status: 'live',
        raw: data,
        activeUsers,
        sessions,
        pageViews,
        totalPageViews: pageViews,
        avgDuration,
        avgReadingTime: avgReadingTimeMin,
        bounceRate,
        topVisitedPages: topPages
      };
    }
  } catch (err) {
    console.error('Error fetching fetch-google-analytics Edge Function:', err);
  }

  // Fallback to DB aggregation if Edge API is offline
  try {
    const { data: posts } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    const allPosts = posts || [];
    const totalViews = allPosts.reduce((sum, p) => sum + (p.views || 0), 0);
    const publishedPosts = allPosts.filter(p => p.status === 'published');
    const draftPosts = allPosts.filter(p => p.status === 'draft');
    
    const avgReadingTime = allPosts.length > 0 
      ? Math.round(allPosts.reduce((sum, p) => sum + (p.reading_time || 5), 0) / allPosts.length) 
      : 5;

    const topVisited = [...allPosts]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 5)
      .map(p => ({
        path: `/article/${p.slug}`,
        views: p.views || 0,
        title: p.title
      }));

    return {
      source: 'Supabase Edge Function Engine',
      status: 'active',
      activeUsers: 1,
      sessions: 1,
      pageViews: totalViews,
      totalPageViews: totalViews,
      publishedCount: publishedPosts.length,
      draftCount: draftPosts.length,
      avgDuration: `${avgReadingTime}m 00s`,
      avgReadingTime: avgReadingTime,
      bounceRate: '0%',
      topVisitedPages: topVisited
    };
  } catch (err) {
    return null;
  }
}

// ==================== ACTIVITY LOG SERVICES ====================

export async function logActivity({ action, entity_type, entity_id, description, actor_name, actor_email, metadata = {} }) {
  try {
    const logEntry = {
      action,
      entity_type,
      entity_id: entity_id ? String(entity_id) : null,
      description,
      actor_name: actor_name || 'System',
      actor_email: actor_email || null,
      metadata
    };

    const { data, error } = await supabase
      .from('activity_logs')
      .insert([logEntry])
      .select('*');

    if (error) {
      console.warn('Supabase activity_logs insert note:', error.message);
    }
    return (data && data[0]) ? data[0] : logEntry;
  } catch (err) {
    console.error('Error logging activity:', err);
    return null;
  }
}

export async function getActivityLogs(limit = 20) {
  try {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching activity_logs:', error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error('Error in getActivityLogs:', err);
    return [];
  }
}

// ==================== PUBLIC PORTAL SERVICES ====================

export async function getCategories() {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching categories from database:', error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error('Error in getCategories:', err);
    return [];
  }
}

export async function createCategory(catData) {
  try {
    const slugified = catData.slug || catData.name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
    const categoryId = (catData.id && catData.id.includes('-') && catData.id.length > 20)
      ? catData.id 
      : (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : undefined);

    const payload = {
      name: catData.name.trim(),
      slug: slugified,
      description: (catData.description || '').trim(),
      color: catData.color || '#ff5500',
      is_active: catData.is_active !== false,
      sort_order: catData.sort_order || 99
    };

    if (categoryId) {
      payload.id = categoryId;
    }

    const { data, error } = await supabase
      .from('categories')
      .insert([payload])
      .select('*');

    logActivity({
      action: 'CATEGORY_CREATED',
      entity_type: 'category',
      description: `Created new category "${payload.name}"`,
      actor_name: 'Admin'
    });

    if (error) {
      console.error('Error inserting category to Supabase:', error);
      return {
        id: categoryId || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `cat-${Date.now()}`),
        ...payload
      };
    }
    return (data && data[0]) ? data[0] : payload;
  } catch (err) {
    console.error('Error in createCategory:', err);
    return {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `cat-${Date.now()}`,
      name: catData.name,
      slug: catData.slug || catData.name.toLowerCase().replace(/\s+/g, '-'),
      description: catData.description || '',
      color: catData.color || '#ff5500',
      is_active: true
    };
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
      console.error('Error fetching posts:', error);
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
    const sessionKey = `motoshift_viewed_${id}`;
    try {
      if (sessionStorage.getItem(sessionKey)) {
        return; // Already incremented view for this article in current session
      }
      sessionStorage.setItem(sessionKey, 'true');
    } catch (storageErr) {
      // Storage unavailable fallback
    }

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

    logActivity({
      action: postData.id ? 'POST_UPDATED' : 'POST_CREATED',
      entity_type: 'post',
      entity_id: postData.id || cleanData.slug,
      description: `${postData.id ? 'Updated' : 'Created'} article "${cleanData.title}" (${cleanData.status || 'published'})`,
      actor_name: 'Admin'
    });

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

// Client-Side Canvas Image Compression Utility
async function compressImageFile(file, maxWidth = 1920, maxHeight = 1080, quality = 0.82) {
  if (!file || !file.type || !file.type.startsWith('image/') || file.type.includes('svg') || file.type.includes('gif')) {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob && blob.size < file.size) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
}

export async function uploadMediaAdmin(file, userId = null) {
  try {
    // 1. Client-Side Image Compression
    const fileToUpload = await compressImageFile(file);

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'nanday';
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ml_default';
    const cloudFolder = import.meta.env.VITE_CLOUDINARY_FOLDER || 'motoshift';

    let publicUrl = '';
    let publicId = `${Date.now()}_${fileToUpload.name.replace(/\s+/g, '_')}`;
    let width = null;
    let height = null;
    let bytes = fileToUpload.size || 0;
    let format = fileToUpload.name.split('.').pop() || 'jpg';

    // 2. Upload file to Cloudinary REST API endpoint with dedicated folder
    try {
      const formData = new FormData();
      formData.append('file', fileToUpload);
      formData.append('upload_preset', uploadPreset);
      formData.append('folder', cloudFolder);

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
      publicUrl = URL.createObjectURL(fileToUpload);
    }

    // 3. Prepare metadata record for Supabase media table
    const mediaRecord = {
      filename: publicId,
      original_filename: file.name,
      storage_path: `cloudinary://${publicId}`,
      public_url: publicUrl,
      mime_type: fileToUpload.type || `image/${format}`,
      extension: format,
      size: bytes,
      width: width,
      height: height,
      uploaded_by: (userId && typeof userId === 'string' && userId.length === 36) ? userId : null,
      is_deleted: false
    };

    // 4. Save uploaded compressed image record in Supabase `media` table
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

export async function updateMediaAdmin(id, updates) {
  try {
    const { data, error } = await supabase
      .from('media')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw error;
    return data[0];
  } catch (err) {
    console.error('Error updating media record:', err);
    throw err;
  }
}

export async function deleteMediaAdmin(id) {
  try {
    const { error } = await supabase
      .from('media')
      .update({ is_deleted: true })
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error deleting media record:', err);
    throw err;
  }
}
