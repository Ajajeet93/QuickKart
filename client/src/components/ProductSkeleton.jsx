import React from 'react';

const ProductSkeleton = () => {
    return (
        <div className="bg-white rounded-2xl p-2.5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-transparent h-full flex flex-col">
            {/* Image Skeleton */}
            <div className="relative aspect-[4/3] mb-2 rounded-xl overflow-hidden bg-gray-200 animate-pulse"></div>

            {/* Content Skeleton */}
            <div className="flex flex-col flex-1 px-1 gap-2">
                {/* Title */}
                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>

                {/* Weight */}
                <div className="h-3 bg-gray-100 rounded w-1/4 animate-pulse mb-1"></div>

                {/* Price & Button */}
                <div className="mt-auto flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                        <div className="h-3 bg-gray-100 rounded w-10 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-14 animate-pulse"></div>
                    </div>
                    <div className="h-8 w-20 bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
            </div>
        </div>
    );
};

export default ProductSkeleton;
