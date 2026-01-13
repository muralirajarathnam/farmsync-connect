import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  MapPin, 
  Heart, 
  MessageCircle,
  Tractor,
  Sprout,
  Package,
  FlaskConical,
  Plus
} from 'lucide-react';
import { PageTransition } from '@/components/PageTransition';
import { TopHeader } from '@/components/TopHeader';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type ListingCategory = 'all' | 'produce' | 'equipment' | 'chemicals' | 'seeds';

interface Listing {
  id: string;
  title: string;
  price: number;
  unit?: string;
  category: ListingCategory;
  location: string;
  distance: string;
  seller: string;
  image: string;
  isNew: boolean;
  isFavorite: boolean;
  postedAt: string;
}

const mockListings: Listing[] = [
  {
    id: '1',
    title: 'Fresh Organic Tomatoes',
    price: 45,
    unit: 'kg',
    category: 'produce',
    location: 'Bangalore Rural',
    distance: '12 km',
    seller: 'Raju Farms',
    image: 'https://images.unsplash.com/photo-1546470427-227c7e4c3c6c?w=400',
    isNew: true,
    isFavorite: false,
    postedAt: '2 hours ago'
  },
  {
    id: '2',
    title: 'John Deere Tractor - 45HP',
    price: 450000,
    category: 'equipment',
    location: 'Mysore',
    distance: '45 km',
    seller: 'Kumar Machinery',
    image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400',
    isNew: false,
    isFavorite: true,
    postedAt: '1 day ago'
  },
  {
    id: '3',
    title: 'NPK Fertilizer 50kg Bag',
    price: 1200,
    unit: 'bag',
    category: 'chemicals',
    location: 'Mandya',
    distance: '28 km',
    seller: 'Agri Supplies Co.',
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400',
    isNew: true,
    isFavorite: false,
    postedAt: '5 hours ago'
  },
  {
    id: '4',
    title: 'Hybrid Rice Seeds - 10kg',
    price: 850,
    unit: 'pack',
    category: 'seeds',
    location: 'Hassan',
    distance: '65 km',
    seller: 'Seed World',
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400',
    isNew: false,
    isFavorite: false,
    postedAt: '3 days ago'
  },
  {
    id: '5',
    title: 'Rotavator - Used (Good Condition)',
    price: 85000,
    category: 'equipment',
    location: 'Tumkur',
    distance: '35 km',
    seller: 'Farm Tools Hub',
    image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400',
    isNew: false,
    isFavorite: true,
    postedAt: '1 week ago'
  },
  {
    id: '6',
    title: 'Fresh Mangoes - Alphonso',
    price: 120,
    unit: 'kg',
    category: 'produce',
    location: 'Ramanagara',
    distance: '20 km',
    seller: 'Mango Valley',
    image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400',
    isNew: true,
    isFavorite: false,
    postedAt: '30 minutes ago'
  }
];

const categoryIcons = {
  all: Package,
  produce: Sprout,
  equipment: Tractor,
  chemicals: FlaskConical,
  seeds: Sprout
};

export default function Marketplace() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<ListingCategory>('all');
  const [favorites, setFavorites] = useState<Set<string>>(
    new Set(mockListings.filter(l => l.isFavorite).map(l => l.id))
  );

  const filteredListings = mockListings.filter(listing => {
    const matchesSearch = listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.seller.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || listing.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const formatPrice = (price: number, unit?: string) => {
    const formatted = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
    return unit ? `${formatted}/${unit}` : formatted;
  };

  return (
    <PageTransition>
      <div className="flex min-h-screen flex-col bg-background pb-24">
        <TopHeader />
        
        <div className="flex-1 space-y-4 p-4">
          {/* Page Title */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{t('marketplace.title')}</h1>
              <p className="text-sm text-muted-foreground">{t('marketplace.subtitle')}</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t('marketplace.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-base"
              />
            </div>
            <Button variant="outline" size="icon" className="h-12 w-12">
              <Filter className="h-5 w-5" />
            </Button>
          </div>

          {/* Category Tabs */}
          <Tabs value={activeCategory} onValueChange={(v) => setActiveCategory(v as ListingCategory)}>
            <TabsList className="w-full h-auto p-1 grid grid-cols-5">
              {(['all', 'produce', 'equipment', 'chemicals', 'seeds'] as ListingCategory[]).map((cat) => {
                const Icon = categoryIcons[cat];
                return (
                  <TabsTrigger 
                    key={cat} 
                    value={cat}
                    className="flex flex-col gap-1 py-2 text-xs"
                  >
                    <Icon className="h-4 w-4" />
                    {t(`marketplace.categories.${cat}`)}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>

          {/* Listings Grid */}
          <div className="grid grid-cols-2 gap-3">
            {filteredListings.map((listing, index) => (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="overflow-hidden touch-target">
                  <div className="relative aspect-square">
                    <img
                      src={listing.image}
                      alt={listing.title}
                      className="h-full w-full object-cover"
                    />
                    {listing.isNew && (
                      <Badge className="absolute left-2 top-2 bg-primary text-primary-foreground">
                        {t('marketplace.new')}
                      </Badge>
                    )}
                    <button
                      onClick={() => toggleFavorite(listing.id)}
                      className="absolute right-2 top-2 rounded-full bg-background/80 p-2 backdrop-blur-sm touch-target"
                    >
                      <Heart 
                        className={`h-4 w-4 ${
                          favorites.has(listing.id) 
                            ? 'fill-red-500 text-red-500' 
                            : 'text-muted-foreground'
                        }`} 
                      />
                    </button>
                  </div>
                  <CardContent className="p-3">
                    <h3 className="font-semibold text-sm line-clamp-2 leading-tight">
                      {listing.title}
                    </h3>
                    <p className="mt-1 text-lg font-bold text-primary">
                      {formatPrice(listing.price, listing.unit)}
                    </p>
                    <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{listing.location}</span>
                      <span>• {listing.distance}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {listing.postedAt}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {filteredListings.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="h-16 w-16 text-muted-foreground/50" />
              <h3 className="mt-4 font-semibold">{t('marketplace.noListings')}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {t('marketplace.tryDifferentSearch')}
              </p>
            </div>
          )}
        </div>

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
