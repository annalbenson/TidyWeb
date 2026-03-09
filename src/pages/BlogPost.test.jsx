import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import BlogPost from './BlogPost';
import { POSTS } from '../data/posts';

function renderBlogPost(slug) {
    return render(
        <MemoryRouter initialEntries={[`/blog/${slug}`]}>
            <Routes>
                <Route path="/blog/:slug" element={<BlogPost />} />
            </Routes>
        </MemoryRouter>
    );
}

describe('BlogPost — valid slug', () => {
    const post = POSTS[0]; // 10-minute-reset

    it('renders the post title as an h1', () => {
        renderBlogPost(post.slug);
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(post.title);
    });

    it('renders the post date', () => {
        renderBlogPost(post.slug);
        expect(screen.getByText(post.date)).toBeInTheDocument();
    });

    it('renders the post category chip', () => {
        renderBlogPost(post.slug);
        expect(screen.getByText(post.category)).toBeInTheDocument();
    });

    it('renders all section headings', () => {
        renderBlogPost(post.slug);
        for (const section of post.sections) {
            expect(screen.getByText(section.heading)).toBeInTheDocument();
        }
    });

    it('renders all section body text', () => {
        renderBlogPost(post.slug);
        for (const section of post.sections) {
            expect(screen.getByText(section.body)).toBeInTheDocument();
        }
    });

    it('renders the back link to /blog', () => {
        renderBlogPost(post.slug);
        const backLinks = screen.getAllByRole('link', { name: /all posts/i });
        expect(backLinks.length).toBeGreaterThan(0);
        expect(backLinks[0].getAttribute('href')).toBe('/blog');
    });

    it('does not render the not-found message', () => {
        renderBlogPost(post.slug);
        expect(screen.queryByText('Post not found.')).toBeNull();
    });
});

describe('BlogPost — Hack Review category', () => {
    const post = POSTS.find(p => p.category === 'Hack Review');

    it('renders the title correctly', () => {
        renderBlogPost(post.slug);
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(post.title);
    });

    it('renders the category chip with correct text', () => {
        renderBlogPost(post.slug);
        expect(screen.getByText('Hack Review')).toBeInTheDocument();
    });

    it('renders all five section headings', () => {
        renderBlogPost(post.slug);
        expect(post.sections.length).toBe(5);
        for (const section of post.sections) {
            expect(screen.getByText(section.heading)).toBeInTheDocument();
        }
    });
});

describe('BlogPost — Seasonal category', () => {
    const post = POSTS.find(p => p.category === 'Seasonal');

    it('renders the correct title', () => {
        renderBlogPost(post.slug);
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(post.title);
    });

    it('renders the Seasonal category chip', () => {
        renderBlogPost(post.slug);
        expect(screen.getByText('Seasonal')).toBeInTheDocument();
    });
});

describe('BlogPost — invalid slug', () => {
    it('renders the not-found message', () => {
        renderBlogPost('this-does-not-exist');
        expect(screen.getByText('Post not found.')).toBeInTheDocument();
    });

    it('renders a back link when post is not found', () => {
        renderBlogPost('this-does-not-exist');
        const backLinks = screen.getAllByRole('link', { name: /back to blog/i });
        expect(backLinks.length).toBeGreaterThan(0);
    });

    it('does not render an h1 article title when post is not found', () => {
        renderBlogPost('this-does-not-exist');
        expect(screen.queryByRole('heading', { level: 1 })).toBeNull();
    });
});
