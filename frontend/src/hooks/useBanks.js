// frontend/src/hooks/useBanks.js
import { useState, useEffect } from 'react';
import api from '../config/api';

export const useBanks = () => {
    const [banks, setBanks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBanks = async () => {
            try {
                setLoading(true);
                const response = await api.get('/banks');
                setBanks(response.data);
                setError(null);
            } catch (err) {
                console.error('Error fetching banks:', err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchBanks();
    }, []);

    return { banks, loading, error };
};
