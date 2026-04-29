import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { RESCUE_BAGS } from '../../constants/data';
import { BagCard } from '@/components/ui/BagCard';

const SORT_OPTIONS = ['Nearest', 'Lowest Price', 'Highest Discount', 'Top Rated', 'Pickup Soon'];
const CITIES = ['All Cities', 'Bengaluru', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai', 'Pune'];
const CUISINES = ['All Cuisines', 'North Indian', 'South Indian', 'Bakery & Café', 'Biryani & Mughlai', 'Street Food', 'Healthy'];

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [selectedSort, setSelectedSort] = useState('Nearest');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [selectedCuisine, setSelectedCuisine] = useState('All Cuisines');
  const [vegOnly, setVegOnly] = useState(false);

  const filtered = useMemo(() => {
    let bags = [...RESCUE_BAGS];
    if (query) {
      const q = query.toLowerCase();
      bags = bags.filter(
        b =>
          b.restaurant.name.toLowerCase().includes(q) ||
          b.restaurant.cuisine.toLowerCase().includes(q) ||
          b.name.toLowerCase().includes(q)
      );
    }
    if (selectedCity !== 'All Cities') {
      bags = bags.filter(b => b.restaurant.city === selectedCity);
    }
    if (selectedCuisine !== 'All Cuisines') {
      bags = bags.filter(b => b.restaurant.cuisine.includes(selectedCuisine));
    }
    if (vegOnly) {
      bags = bags.filter(b => b.allergenNote.toLowerCase().includes('vegetarian') || b.allergenNote.toLowerCase().includes('veg'));
    }
    switch (selectedSort) {
      case 'Lowest Price':
        bags.sort((a, b) => a.rescuePrice - b.rescuePrice);
        break;
      case 'Highest Discount':
        bags.sort((a, b) => (b.originalPrice - b.rescuePrice) / b.originalPrice - (a.originalPrice - a.rescuePrice) / a.originalPrice);
        break;
      case 'Top Rated':
        bags.sort((a, b) => b.restaurant.rating - a.restaurant.rating);
        break;
    }
    return bags;
  }, [query, selectedSort, selectedCity, selectedCuisine, vegOnly]);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Search Bar */}
      <View style={styles.topBar}>
        <View style={styles.searchBox}>
          <Search size={18} color={Colors.warmTaupe} />
          <TextInput
            style={styles.input}
            placeholder="Search restaurants, cuisines..."
            placeholderTextColor={Colors.warmTaupe}
            value={query}
            onChangeText={setQuery}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <X size={16} color={Colors.warmTaupe} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.filterIconBtn} onPress={() => setShowFilters(true)}>
          <SlidersHorizontal size={20} color={Colors.forestGreen} />
        </TouchableOpacity>
      </View>

      {/* Sort Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sortRow} contentContainerStyle={styles.sortContent}>
        {SORT_OPTIONS.map(opt => (
          <TouchableOpacity
            key={opt}
            style={[styles.sortChip, selectedSort === opt && styles.sortChipActive]}
            onPress={() => setSelectedSort(opt)}
          >
            <Text style={[styles.sortChipText, selectedSort === opt && styles.sortChipTextActive]}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Results */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.results}>
        {filtered.length > 0 ? (
          <>
            <Text style={styles.resultCount}>{filtered.length} rescues found</Text>
            {filtered.map(bag => <BagCard key={bag.id} bag={bag} />)}
          </>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No rescues found yet.</Text>
            <Text style={styles.emptySub}>Try a different area, cuisine, or time. A new chapter awaits!</Text>
            <TouchableOpacity style={styles.resetBtn} onPress={() => { setQuery(''); setSelectedCity('All Cities'); setSelectedCuisine('All Cuisines'); setVegOnly(false); }}>
              <Text style={styles.resetBtnText}>Reset Filters</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Filter Modal */}
      <Modal visible={showFilters} animationType="slide" transparent>
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowFilters(false)} activeOpacity={1}>
          <View style={styles.filterSheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Filter Rescues</Text>

            <Text style={styles.filterLabel}>City</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
              {CITIES.map(c => (
                <TouchableOpacity
                  key={c}
                  style={[styles.filterChip, selectedCity === c && styles.filterChipActive]}
                  onPress={() => setSelectedCity(c)}
                >
                  <Text style={[styles.filterChipText, selectedCity === c && styles.filterChipTextActive]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.filterLabel}>Cuisine</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
              {CUISINES.map(c => (
                <TouchableOpacity
                  key={c}
                  style={[styles.filterChip, selectedCuisine === c && styles.filterChipActive]}
                  onPress={() => setSelectedCuisine(c)}
                >
                  <Text style={[styles.filterChipText, selectedCuisine === c && styles.filterChipTextActive]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity style={styles.vegToggle} onPress={() => setVegOnly(!vegOnly)}>
              <View style={[styles.vegBox, vegOnly && styles.vegBoxActive]}>
                {vegOnly && <Text style={styles.checkMark}>✓</Text>}
              </View>
              <Text style={styles.vegLabel}>Veg Only</Text>
            </TouchableOpacity>

            <View style={styles.sheetBtns}>
              <TouchableOpacity
                style={styles.resetSheetBtn}
                onPress={() => { setSelectedCity('All Cities'); setSelectedCuisine('All Cuisines'); setVegOnly(false); }}
              >
                <Text style={styles.resetSheetText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyBtn} onPress={() => setShowFilters(false)}>
                <Text style={styles.applyBtnText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.offWhite,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'DMSans-Regular',
    color: Colors.deepEspresso,
    padding: 0,
  },
  filterIconBtn: {
    backgroundColor: Colors.offWhite,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sortRow: {
    maxHeight: 50,
    marginBottom: 4,
  },
  sortContent: {
    paddingHorizontal: 20,
    gap: 8,
    alignItems: 'center',
  },
  sortChip: {
    backgroundColor: Colors.softBeige,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  sortChipActive: {
    backgroundColor: Colors.forestGreen,
  },
  sortChipText: {
    fontSize: 16,
    fontFamily: 'DMSans-Medium',
    color: Colors.warmStone,
  },
  sortChipTextActive: {
    color: Colors.offWhite,
  },
  results: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 100,
  },
  resultCount: {
    fontSize: 13,
    fontFamily: 'DMSans-Regular',
    color: Colors.warmStone,
    marginBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'PlayfairDisplay-Bold',
    color: Colors.deepEspresso,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 14,
    fontFamily: 'DMSans-Regular',
    color: Colors.warmStone,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  resetBtn: {
    backgroundColor: Colors.sageGreen,
    borderRadius: 14,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  resetBtnText: {
    fontSize: 14,
    fontFamily: 'DMSans-Bold',
    color: Colors.offWhite,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  filterSheet: {
    backgroundColor: Colors.cream,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.warmTaupe,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 20,
    fontFamily: 'PlayfairDisplay-Bold',
    color: Colors.deepEspresso,
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 14,
    fontFamily: 'DMSans-Bold',
    color: Colors.deepEspresso,
    marginBottom: 10,
  },
  filterRow: {
    maxHeight: 44,
    marginBottom: 20,
  },
  filterChip: {
    backgroundColor: Colors.softBeige,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: Colors.sageGreen,
  },
  filterChipText: {
    fontSize: 15,
    fontFamily: 'DMSans-Medium',
    color: Colors.warmStone,
  },
  filterChipTextActive: {
    color: Colors.offWhite,
  },
  vegToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 28,
  },
  vegBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.warmTaupe,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vegBoxActive: {
    backgroundColor: Colors.sageGreen,
    borderColor: Colors.sageGreen,
  },
  checkMark: {
    color: Colors.offWhite,
    fontSize: 14,
    fontFamily: 'DMSans-Bold',
  },
  vegLabel: {
    fontSize: 15,
    fontFamily: 'DMSans-Medium',
    color: Colors.deepEspresso,
  },
  sheetBtns: {
    flexDirection: 'row',
    gap: 12,
  },
  resetSheetBtn: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  resetSheetText: {
    fontSize: 15,
    fontFamily: 'DMSans-Bold',
    color: Colors.warmStone,
  },
  applyBtn: {
    flex: 2,
    borderRadius: 14,
    paddingVertical: 14,
    backgroundColor: Colors.sageGreen,
    alignItems: 'center',
  },
  applyBtnText: {
    fontSize: 15,
    fontFamily: 'DMSans-Bold',
    color: Colors.offWhite,
  },
});
