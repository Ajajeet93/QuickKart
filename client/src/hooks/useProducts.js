import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../store/productSlice';

export const useProducts = (categoryFilter = null, searchQuery = null, pageNum = 1) => {
    const dispatch = useDispatch();
    const { items, loading, error, hasMore, page, total } = useSelector((state) => state.products);

    useEffect(() => {
        // Detect if the filter is a MongoDB ObjectId (24 hex chars) or a plain name string
        const isObjectId = categoryFilter && /^[0-9a-fA-F]{24}$/.test(categoryFilter);
        dispatch(fetchProducts({
            categoryId: isObjectId ? categoryFilter : undefined,
            category:   !isObjectId ? categoryFilter : undefined,
            search: searchQuery,
            page: pageNum,
            limit: 12
        }));
    }, [dispatch, categoryFilter, searchQuery, pageNum]);

    const filterProducts = (searchTerm) => {
        // Redux slice already filters via backend, but if we want local filtering:
        if (searchTerm) {
            return items.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        if (categoryFilter) {
            return items.filter(item => item.category === categoryFilter || item.category?._id === categoryFilter);
        }
        return items;
    };

    return {
        products: items,
        loading,
        error,
        hasMore,
        page,
        total,
        filterProducts,
        refresh: () => dispatch(fetchProducts({ categoryId: categoryFilter, search: searchQuery, page: pageNum, limit: 12 }))
    };
};
