import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreHorizontal,
  Image,
  Send,
  TrendingUp,
  Users,
  Bookmark,
  Plus
} from 'lucide-react';
import { PageTransition } from '@/components/PageTransition';
import { TopHeader } from '@/components/TopHeader';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';

interface Post {
  id: string;
  author: {
    name: string;
    avatar?: string;
    location: string;
    isVerified: boolean;
  };
  content: string;
  images?: string[];
  tags: string[];
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  isBookmarked: boolean;
  postedAt: string;
}

interface TrendingTopic {
  id: string;
  tag: string;
  posts: number;
}

const mockPosts: Post[] = [
  {
    id: '1',
    author: {
      name: 'Ramesh Kumar',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      location: 'Karnataka',
      isVerified: true
    },
    content: 'Just harvested my first batch of organic turmeric this season! 🌿 The color and aroma are amazing. Using natural composting methods really made a difference. Happy to share tips with anyone interested!',
    images: ['https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=600'],
    tags: ['OrganicFarming', 'Turmeric', 'Harvest'],
    likes: 234,
    comments: 45,
    shares: 12,
    isLiked: true,
    isBookmarked: false,
    postedAt: '2 hours ago'
  },
  {
    id: '2',
    author: {
      name: 'Lakshmi Devi',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
      location: 'Andhra Pradesh',
      isVerified: false
    },
    content: 'Has anyone tried the new drip irrigation system from Jain Irrigation? Looking for reviews before investing. My current setup is getting old and needs replacement. Budget is around 50k for 2 acres.',
    tags: ['Irrigation', 'FarmTech', 'Question'],
    likes: 56,
    comments: 89,
    shares: 5,
    isLiked: false,
    isBookmarked: true,
    postedAt: '5 hours ago'
  },
  {
    id: '3',
    author: {
      name: 'Agricultural University',
      avatar: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100',
      location: 'Dharwad',
      isVerified: true
    },
    content: '📢 Free Workshop Alert! Join us this Saturday for a hands-on session on "Integrated Pest Management for Rabi Crops". Expert speakers from ICAR will be present. Registration link in bio!',
    images: ['https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=600'],
    tags: ['Workshop', 'PestManagement', 'Education'],
    likes: 445,
    comments: 67,
    shares: 156,
    isLiked: false,
    isBookmarked: false,
    postedAt: '1 day ago'
  },
  {
    id: '4',
    author: {
      name: 'Suresh Patil',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
      location: 'Maharashtra',
      isVerified: false
    },
    content: 'Monsoon update from my farm 🌧️ Finally got good rains after 3 weeks. Soybean crop is recovering well. Remember to drain excess water to prevent root rot. Stay safe everyone!',
    images: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600',
      'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600'
    ],
    tags: ['Monsoon', 'Soybean', 'WeatherUpdate'],
    likes: 189,
    comments: 34,
    shares: 23,
    isLiked: true,
    isBookmarked: true,
    postedAt: '2 days ago'
  }
];

const trendingTopics: TrendingTopic[] = [
  { id: '1', tag: 'OrganicFarming', posts: 1250 },
  { id: '2', tag: 'MonsoonCrops', posts: 890 },
  { id: '3', tag: 'FarmMachinery', posts: 654 },
  { id: '4', tag: 'MSPUpdate', posts: 543 },
  { id: '5', tag: 'DroughtRelief', posts: 432 }
];

export default function Farmersmedia() {
  const { t } = useTranslation();
  const [posts, setPosts] = useState(mockPosts);
  const [activeTab, setActiveTab] = useState('feed');

  const toggleLike = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
        : post
    ));
  };

  const toggleBookmark = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, isBookmarked: !post.isBookmarked }
        : post
    ));
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  return (
    <PageTransition>
      <div className="flex min-h-screen flex-col bg-background pb-24">
        <TopHeader />
        
        <div className="px-4 pt-4 pb-2">
          <h1 className="text-2xl font-bold">{t('farmersmedia.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('farmersmedia.subtitle')}</p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="sticky top-0 z-10 w-full rounded-none border-b bg-background h-12">
            <TabsTrigger value="feed" className="flex-1 gap-2">
              <Users className="h-4 w-4" />
              {t('farmersmedia.feed')}
            </TabsTrigger>
            <TabsTrigger value="trending" className="flex-1 gap-2">
              <TrendingUp className="h-4 w-4" />
              {t('farmersmedia.trending')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="mt-0 space-y-4 p-4">
            {/* Create Post Card */}
            <Card>
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>ME</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Textarea 
                      placeholder={t('farmersmedia.whatsOnMind')}
                      className="min-h-[60px] resize-none border-0 p-0 focus-visible:ring-0"
                    />
                    <div className="mt-3 flex items-center justify-between">
                      <Button variant="ghost" size="sm" className="gap-2">
                        <Image className="h-4 w-4" />
                        {t('farmersmedia.addPhoto')}
                      </Button>
                      <Button size="sm" className="gap-2">
                        <Send className="h-4 w-4" />
                        {t('farmersmedia.post')}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Posts Feed */}
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card>
                  <CardHeader className="flex-row items-start gap-3 space-y-0 p-4 pb-2">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={post.author.avatar} />
                      <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-1">
                        <span className="font-semibold">{post.author.name}</span>
                        {post.author.isVerified && (
                          <Badge variant="secondary" className="h-4 px-1 text-[10px]">
                            ✓
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {post.author.location} • {post.postedAt}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  
                  <CardContent className="px-4 py-2">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {post.content}
                    </p>
                    
                    {post.images && post.images.length > 0 && (
                      <div className={`mt-3 grid gap-2 ${
                        post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
                      }`}>
                        {post.images.map((img, idx) => (
                          <img
                            key={idx}
                            src={img}
                            alt=""
                            className="rounded-lg w-full h-40 object-cover"
                          />
                        ))}
                      </div>
                    )}
                    
                    <div className="mt-3 flex flex-wrap gap-2">
                      {post.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                  
                  <CardFooter className="border-t px-4 py-2">
                    <div className="flex w-full items-center justify-between">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="gap-2"
                        onClick={() => toggleLike(post.id)}
                      >
                        <Heart className={`h-4 w-4 ${
                          post.isLiked ? 'fill-red-500 text-red-500' : ''
                        }`} />
                        {formatNumber(post.likes)}
                      </Button>
                      <Button variant="ghost" size="sm" className="gap-2">
                        <MessageCircle className="h-4 w-4" />
                        {formatNumber(post.comments)}
                      </Button>
                      <Button variant="ghost" size="sm" className="gap-2">
                        <Share2 className="h-4 w-4" />
                        {formatNumber(post.shares)}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => toggleBookmark(post.id)}
                      >
                        <Bookmark className={`h-4 w-4 ${
                          post.isBookmarked ? 'fill-current' : ''
                        }`} />
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          <TabsContent value="trending" className="mt-0 p-4">
            <h3 className="mb-4 font-semibold">{t('farmersmedia.trendingTopics')}</h3>
            <div className="space-y-3">
              {trendingTopics.map((topic, index) => (
                <motion.div
                  key={topic.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="touch-target">
                    <CardContent className="flex items-center justify-between p-4">
                      <div>
                        <p className="font-semibold text-primary">#{topic.tag}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatNumber(topic.posts)} {t('farmersmedia.posts')}
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-lg font-bold">
                        #{index + 1}
                      </Badge>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Suggested Users */}
            <h3 className="mb-4 mt-8 font-semibold">{t('farmersmedia.suggestedToFollow')}</h3>
            <div className="space-y-3">
              {mockPosts.slice(0, 3).map((post, index) => (
                <Card key={post.id}>
                  <CardContent className="flex items-center gap-3 p-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={post.author.avatar} />
                      <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-1">
                        <span className="font-semibold">{post.author.name}</span>
                        {post.author.isVerified && (
                          <Badge variant="secondary" className="h-4 px-1 text-[10px]">
                            ✓
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{post.author.location}</p>
                    </div>
                    <Button size="sm" variant="outline">
                      {t('farmersmedia.follow')}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Floating Action Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-24 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg"
        >
          <Plus className="h-6 w-6" />
        </motion.button>
      </div>
    </PageTransition>
  );
}
