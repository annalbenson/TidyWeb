import { describe, it, expect } from 'vitest';
import { POSTS, getPost } from './posts';

describe('POSTS', () => {
    it('contains at least one post', () => {
        expect(POSTS.length).toBeGreaterThan(0);
    });

    it('every post has required fields', () => {
        for (const post of POSTS) {
            expect(post).toHaveProperty('slug');
            expect(post).toHaveProperty('title');
            expect(post).toHaveProperty('category');
            expect(post).toHaveProperty('date');
            expect(post).toHaveProperty('excerpt');
            expect(post).toHaveProperty('sections');
        }
    });

    it('every post has at least one section', () => {
        for (const post of POSTS) {
            expect(post.sections.length).toBeGreaterThan(0);
        }
    });

    it('every section has a heading and body', () => {
        for (const post of POSTS) {
            for (const section of post.sections) {
                expect(section).toHaveProperty('heading');
                expect(section).toHaveProperty('body');
            }
        }
    });

    it('slugs are unique across all posts', () => {
        const slugs = POSTS.map(p => p.slug);
        const unique = new Set(slugs);
        expect(unique.size).toBe(slugs.length);
    });
});

describe('getPost', () => {
    it('returns the matching post when slug exists', () => {
        const post = getPost('10-minute-reset');
        expect(post).toBeDefined();
        expect(post.slug).toBe('10-minute-reset');
    });

    it('returns the correct title for a known slug', () => {
        const post = getPost('tiktok-cleaning-hacks');
        expect(post.title).toBe("We Tried 5 Viral TikTok Cleaning Hacks So You Don't Have To");
    });

    it('returns undefined when slug does not exist', () => {
        const post = getPost('nonexistent-slug');
        expect(post).toBeUndefined();
    });

    it('returns undefined for an empty string slug', () => {
        const post = getPost('');
        expect(post).toBeUndefined();
    });

    it('returns the spring-cleaning-checklist post with correct category', () => {
        const post = getPost('spring-cleaning-checklist');
        expect(post.category).toBe('Seasonal');
    });
});
