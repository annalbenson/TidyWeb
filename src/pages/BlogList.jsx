import { Link } from 'react-router-dom';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import { POSTS } from '../data/posts';

function categoryClass(category) {
    if (category === 'Tip Roundup') return 'roundup';
    if (category === 'Hack Review') return 'review';
    if (category === 'Seasonal')   return 'seasonal';
    return 'roundup';
}

function categoryEmoji(category) {
    if (category === 'Tip Roundup') return '✅';
    if (category === 'Hack Review') return '🧪';
    if (category === 'Seasonal')    return '🌸';
    return '📝';
}

export default function BlogList() {
    return (
        <>
            <Nav />
            <main className="blog-list-page">
                <h1 className="blog-list-title">Tidy Blog</h1>
                <p className="blog-list-subtitle">Cleaning tips, hack reviews, and seasonal guides — because a tidy home is a happy home.</p>
                <div className="blog-grid">
                    {POSTS.map(post => (
                        <Link key={post.slug} to={`/blog/${post.slug}`} className="blog-card-link">
                            <article className="blog-card">
                                <div className={`blog-card-banner ${categoryClass(post.category)}`}>
                                    {categoryEmoji(post.category)}
                                </div>
                                <div className="blog-card-body">
                                    <span className={`blog-category-chip ${categoryClass(post.category)}`}>{post.category}</span>
                                    <h2 className="blog-card-title">{post.title}</h2>
                                    <p className="blog-card-date">{post.date}</p>
                                    <p className="blog-card-excerpt">{post.excerpt}</p>
                                    <span className="blog-read-more">Read more →</span>
                                </div>
                            </article>
                        </Link>
                    ))}
                </div>
            </main>
            <Footer />
        </>
    );
}
