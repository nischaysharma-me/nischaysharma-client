'use server';

import { postsService } from '@/services/posts.service';
import { Post } from '@/lib/types/post';
import { ActionResponse } from '@/lib/types/common';

export async function listPostsAction(options = {}): Promise<ActionResponse<Post[]>> {
  try {
    return await postsService.listPosts(options);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
}
