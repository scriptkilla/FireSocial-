import React, { useState, useEffect, useMemo } from 'react';
import { Post, UserListItem, TrendingHashtag, Theme, Profile } from '../types';
import { Heart, MessageSquare, Copy, Search, Mic, SlidersHorizontal, X } from 'lucide-react';
import AvatarDisplay from './AvatarDisplay';

const POSTS_PER_PAGE = 20;

const POST_CATEGORIES = ['All', 'Art', 'Photography', 'Lifestyle', 'Food', 'Travel', 'Tech', 'Fitness', 'Music', 'Business'];

interface ExplorePageProps {
    posts: Post[];
    profile: Profile;
    allUsers: UserListItem[];
    trendingHashtags: TrendingHashtag[];
    following: UserListItem[];
    onViewPost: (post: Post) => void;
    onViewProfile: (username: string) => void;
    onViewHashtag: (tag: string) => void;
    textColor: string;
    textSecondary: string;
    cardBg: string;
    borderColor: string;
    currentTheme: Theme;
}

interface FilterModalProps extends Omit<ExplorePageProps, 'profile' | 'allUsers' | 'trendingHashtags' | 'onViewPost' | 'onViewProfile' | 'onViewHashtag' | 'following' | 'posts'> {
    show: boolean;
    onClose: () => void;
    activeFilters: { category: string, location: string };
    onApply: (filters: { category: string, location: string }) => void;
    locations: string[];
}


const FilterModal: React.FC<FilterModalProps> = (props) => {
    const { show, onClose, activeFilters, onApply, textColor, textSecondary, cardBg, borderColor, currentTheme, locations } = props;
    const [localFilters, setLocalFilters] = useState(activeFilters);
    const isDarkMode = cardBg.includes('gray');
    const modalTextColor = isDarkMode ? 'text-white' : 'text-black';


    if (!show) return null;

    const handleApply = () => {
        onApply(localFilters);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-start justify-center p-4 pt-16">
            <div className={`${cardBg} backdrop-blur-xl ${modalTextColor} rounded-3xl p-6 max-w-lg w-full border ${borderColor} shadow-2xl`}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Filters</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X size={20} className={textSecondary} /></button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className={`block mb-2 text-sm font-semibold ${modalTextColor}`}>Category</label>
                        <div className="flex flex-wrap gap-2">
                            {POST_CATEGORIES.map(cat => (
                                <button key={cat} onClick={() => setLocalFilters(f => ({ ...f, category: cat }))} className={`px-4 py-2 text-sm rounded-full border ${localFilters.category === cat ? `${currentTheme.border} ${modalTextColor} bg-white/10` : `${borderColor} ${modalTextColor}`}`}>{cat}</button>
                            ))}
                        </div>
                    </div>
                     <div>
                        <label className={`block mb-2 text-sm font-semibold ${modalTextColor}`}>Location</label>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setLocalFilters(f => ({ ...f, location: '' }))}
                                className={`px-4 py-2 text-sm rounded-full border ${localFilters.location === '' ? `${currentTheme.border} ${modalTextColor} bg-white/10` : `${borderColor} ${modalTextColor}`}`}
                            >
                                All
                            </button>
                            {locations.map(loc => (
                                <button
                                    key={loc}
                                    onClick={() => setLocalFilters(f => ({ ...f, location: loc }))}
                                    className={`px-4 py-2 text-sm rounded-full border ${localFilters.location === loc ? `${currentTheme.border} ${modalTextColor} bg-white/10` : `${borderColor} ${modalTextColor}`}`}
                                >
                                    {loc}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="flex gap-2 mt-6">
                    <button onClick={() => setLocalFilters({ category: 'All', location: ''})} className={`flex-1 py-3 ${cardBg} backdrop-blur-xl rounded-2xl border ${borderColor} ${modalTextColor} hover:bg-white/10`}>Reset</button>
                    <button onClick={handleApply} className={`flex-1 py-3 bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} text-white rounded-2xl font-semibold`}>Apply Filters</button>
                </div>
            </div>
        </div>
    );
};

const ExplorePage: React.FC<ExplorePageProps> = (props) => {
    const { posts, profile, allUsers, trendingHashtags, following, onViewPost, onViewProfile, onViewHashtag, textColor, textSecondary, cardBg, borderColor, currentTheme } = props;
    
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [activeFilters, setActiveFilters] = useState({ category: 'All', location: '' });

    const [displayedPosts, setDisplayedPosts] = useState<Post[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    const followingIds = useMemo(() => new Set(following?.map(f => f.id) || []), [following]);
    
    const availableLocations = useMemo(() => Array.from(new Set(posts.map(p => p.location).filter(Boolean) as string[])), [posts]);


    const filteredPosts = useMemo(() => {
        return posts
            .filter(p => p.userId !== profile.id && !followingIds.has(p.userId))
            .filter(p => {
                const query = searchQuery.toLowerCase();
                const categoryMatch = activeFilters.category === 'All' || p.category === activeFilters.category;
                const locationMatch = !activeFilters.location || p.location?.toLowerCase() === activeFilters.location.toLowerCase();
                const searchMatch = !query || p.content.toLowerCase().includes(query) || p.user.toLowerCase().includes(query) || p.username.toLowerCase().includes(query);
                return categoryMatch && locationMatch && searchMatch;
            });
    }, [posts, profile.id, followingIds, searchQuery, activeFilters]);

    useEffect(() => {
        setPage(1);
        const newPosts = filteredPosts.slice(0, POSTS_PER_PAGE);
        setDisplayedPosts(newPosts);
        setHasMore(newPosts.length < filteredPosts.length);
    }, [filteredPosts]);

    const loadMorePosts = () => {
        if (isLoading || !hasMore) return;
        setIsLoading(true);
        
        setTimeout(() => { // Simulate network latency
            const nextPage = page + 1;
            const newPosts = filteredPosts.slice(0, nextPage * POSTS_PER_PAGE);
            setDisplayedPosts(newPosts);
            setPage(nextPage);
            setHasMore(newPosts.length < filteredPosts.length);
            setIsLoading(false);
        }, 500);
    };
    
    useEffect(() => {
        const handleScroll = () => {
            if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 500) {
                loadMorePosts();
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isLoading, hasMore, filteredPosts]);

    const featuredCreators = useMemo(() => allUsers.filter(u => u.id !== profile.id && !followingIds.has(u.id)).slice(0, 10), [allUsers, profile.id, followingIds]);

    return (
        <div className="space-y-6">
            <style>{`
                .masonry-grid {
                    column-gap: 1rem;
                    column-count: 2;
                }
                @media (min-width: 768px) { .masonry-grid { column-count: 3; } }
                .masonry-item {
                    break-inside: avoid;
                    margin-bottom: 1rem;
                }
                .horizontal-scroll {
                    scroll-snap-type: x mandatory;
                    -webkit-overflow-scrolling: touch;
                }
                .horizontal-scroll > * {
                    scroll-snap-align: start;
                }
            `}</style>
            <FilterModal 
                show={showFilters} 
                onClose={() => setShowFilters(false)} 
                activeFilters={activeFilters} 
                onApply={setActiveFilters}
                locations={availableLocations}
                textColor={textColor}
                textSecondary={textSecondary}
                cardBg={cardBg}
                borderColor={borderColor}
                currentTheme={currentTheme}
             />
            
            <div>
                <h2 className={`text-3xl font-bold mb-4 ${textColor}`}>Explore</h2>
                <div className="flex gap-2 items-center">
                    <div className="flex-1 relative">
                        <Search size={20} className={`absolute left-4 top-1/2 -translate-y-1/2 ${textSecondary}`} />
                        <input type="text" placeholder="Search for posts, users, tags..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className={`w-full pl-12 pr-12 py-3 ${cardBg} backdrop-blur-xl rounded-2xl border ${borderColor} ${textColor} placeholder-gray-400 focus:outline-none focus:ring-2 ${currentTheme.ring}`} />
                        <button className={`absolute right-4 top-1/2 -translate-y-1/2 p-1 ${textSecondary} hover:${textColor}`}><Mic size={20} /></button>
                    </div>
                    <button onClick={() => setShowFilters(true)} className={`p-3 ${cardBg} backdrop-blur-xl rounded-2xl border ${borderColor} ${textColor} hover:scale-105 transition-all`}>
                        <SlidersHorizontal size={20} />
                    </button>
                </div>
            </div>

            <div className="space-y-8">
                <div>
                    <h3 className={`font-bold text-xl mb-3 ${textColor}`}>Featured Creators</h3>
                    <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 horizontal-scroll">
                        {featuredCreators.map(user => (
                            <button key={user.id} onClick={() => onViewProfile(user.username)} className={`flex-shrink-0 w-36 text-center p-4 rounded-2xl border ${borderColor} ${cardBg} hover:scale-105 transition-transform`}>
                                <AvatarDisplay avatar={user.avatar} size="w-20 h-20" fontSize="text-4xl" className="mx-auto mb-2" />
                                <p className={`font-semibold truncate ${textColor}`}>{user.name}</p>
                                <p className={`text-sm truncate ${textSecondary}`}>{user.username}</p>
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className={`font-bold text-xl mb-3 ${textColor}`}>Trending Tags</h3>
                    <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 horizontal-scroll">
                        {trendingHashtags.map(ht => (
                            <button key={ht.tag} onClick={() => onViewHashtag(ht.tag)} className={`flex-shrink-0 px-5 py-3 rounded-full border ${borderColor} ${cardBg} hover:bg-white/10 transition-colors`}>
                                <p className={`font-bold ${textColor}`}>{ht.tag}</p>
                                <p className={`text-sm ${textSecondary}`}>{ht.posts.toLocaleString()} posts</p>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="masonry-grid">
                {displayedPosts.map(post => (
                    <div
                        key={post.id}
                        onClick={() => onViewPost(post)}
                        className="group relative overflow-hidden rounded-2xl cursor-pointer masonry-item"
                    >
                        {post.media && post.media.length > 0 ? (
                            post.media[0].type === 'image' ? (
                                <img loading="lazy" src={post.media[0].url} alt="Explore post" className="w-full h-auto block transition-transform duration-300 group-hover:scale-110" />
                            ) : (
                                <video src={post.media[0].url} className="w-full h-auto block" />
                            )
                        ) : (
                            <div className={`w-full h-full p-4 ${cardBg} border ${borderColor}`}>
                                <p className={`text-sm line-clamp-6 ${textColor}`}>{post.content}</p>
                            </div>
                        )}
                        
                        {post.media && post.media.length > 1 && (
                            <Copy size={16} className="absolute top-3 right-3 text-white bg-black/30 p-1 rounded-md" />
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4 text-white">
                            <p className="text-sm line-clamp-2 mb-2">{post.content}</p>
                            <div className="flex items-center gap-4 text-sm font-semibold">
                                <span className="flex items-center gap-1"><Heart size={16} /> {post.likes}</span>
                                <span className="flex items-center gap-1"><MessageSquare size={16} /> {post.comments}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            {isLoading && (
                <div className="text-center py-8">
                    <p className={textSecondary}>Loading more...</p>
                </div>
            )}
            {!hasMore && displayedPosts.length > 0 && (
                 <div className="text-center py-8">
                    <p className={textSecondary}>You've reached the end!</p>
                </div>
            )}
            {displayedPosts.length === 0 && !isLoading && (
                 <div className="text-center py-16">
                    <p className={`text-lg font-semibold ${textColor}`}>No results found</p>
                    <p className={textSecondary}>Try adjusting your search or filters.</p>
                </div>
            )}

        </div>
    );
};

export default ExplorePage;