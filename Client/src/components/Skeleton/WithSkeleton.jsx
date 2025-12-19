import React from 'react';

const withSkeleton = (WrappedComponent, skeletonComponent) => {
    return function WithSkeleton(props) {
        const { loading, error, ...restProps } = props;

        if (loading) {
            return skeletonComponent ? skeletonComponent() : <div>Loading...</div>;
        }

        if (error) {
            return (
                <div className="text-center py-12 bg-white border border-gray-200">
                    <p className="text-red-600 text-lg mb-2">⚠️ {error}</p>
                    <p className="text-sm text-gray-500">Something went wrong. Please try again.</p>
                </div>
            );
        }

        return <WrappedComponent {...restProps} />;
    };
};

export default withSkeleton;