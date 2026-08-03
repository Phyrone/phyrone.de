import { allPosts } from '$content';
import Fuse from 'fuse.js';

export const postsSearch = new Fuse(allPosts, {
	keys: ['title', 'description'],
	includeScore: true
});
