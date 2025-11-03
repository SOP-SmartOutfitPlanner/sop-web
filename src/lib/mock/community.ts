import { Post, CommunityUser } from '@/types/community';

// Mock users
const mockUsers: CommunityUser[] = [
  { id: 'user-1', name: 'You' },
  { id: 'user-2', name: 'Sarah Chen' },
  { id: 'user-3', name: 'Alex Rivera' },
  { id: 'user-4', name: 'Maya Patel' },
  { id: 'user-5', name: 'James Kim' },
  { id: 'user-6', name: 'Emma Wilson' },
  { id: 'user-7', name: 'Liam Taylor' }
];

// Mock posts storage
let posts: Post[] = [];

// Initialize posts
export function initializePosts() {
  posts = [];
}

export function getCommunityPosts(): Post[] {
  return posts;
}

export function getPostById(id: string): Post | undefined {
  return posts.find(post => post.id === id);
}

export function addPost(postData: Omit<Post, 'id' | 'likes' | 'timestamp'>): Post {
  const newPost: Post = {
    ...postData,
    id: `post-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    likes: 0,
    timestamp: new Date().toISOString()
  };
  posts.unshift(newPost);
  return newPost;
}

export function likePost(postId: string, userId: string): boolean {
  const post = posts.find(p => p.id === postId);
  if (post) {
    post.likes += 1;
    return true;
  }
  return false;
}

export function addComment(postId: string, userId: string, text: string): boolean {
  const post = posts.find(p => p.id === postId);
  if (post) {
    post.comments.push({
      userId,
      text,
      timestamp: new Date().toISOString()
    });
    return true;
  }
  return false;
}

export function reportPost(postId: string, reason: string, userId: string): boolean {
  const post = posts.find(p => p.id === postId);
  if (post) {
    post.reports.push({
      userId,
      reason,
      timestamp: new Date().toISOString()
    });
    // Hide post if it has 3 or more reports
    if (post.reports.length >= 3) {
      post.status = 'reported';
    }
    return true;
  }
  return false;
}

export function deletePost(postId: string, userId: string): boolean {
  const index = posts.findIndex(p => p.id === postId && p.userId === userId);
  if (index !== -1) {
    posts.splice(index, 1);
    return true;
  }
  return false;
}

export function getUserById(userId: string): CommunityUser | undefined {
  return mockUsers.find(user => user.id === userId);
}

export function getCurrentUser(): CommunityUser {
  return mockUsers[0]; // Always return "You" as current user
}

export function getMockUsers(): CommunityUser[] {
  return mockUsers;
}

