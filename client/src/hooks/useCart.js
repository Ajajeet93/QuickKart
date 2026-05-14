import { useSelector, useDispatch } from 'react-redux';
import { updateQuantityAsync, removeFromCartAsync } from '../store/cartSlice';

export const useCart = () => {
    const dispatch = useDispatch();
    const cartState = useSelector((state) => state.cart);

    const updateQuantity = (id, newQty, weight) => {
        dispatch(updateQuantityAsync({ id, quantity: newQty, weight }));
    };

    const removeItem = (id, weight) => {
        dispatch(removeFromCartAsync({ id, weight }));
    };

    return {
        ...cartState,
        updateQuantity,
        removeItem,
    };
};
