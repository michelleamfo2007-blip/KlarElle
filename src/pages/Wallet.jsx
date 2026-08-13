import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { ChevronLeft, Wallet as WalletIcon, Gift, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

function Wallet() {
  const { session } = useAuth();
  const { formatPrice } = useCurrency();
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [redeemCode, setRedeemCode] = useState('');
  const [redeemStatus, setRedeemStatus] = useState(null); // { type: 'success' | 'error', message: '' }
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    if (session?.user?.email) {
      fetchWallet();
    } else {
      setLoading(false);
    }
  }, [session]);

  const fetchWallet = async () => {
    try {
      // 1. Check if wallet exists for user
      const { data: walletData, error: walletError } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_email', session.user.email)
        .single();
        
      let currentWalletId = null;

      if (!walletData) {
        // Create wallet if it doesn't exist
        const { data: newWallet, error: newWalletError } = await supabase
          .from('wallets')
          .insert([{ user_email: session.user.email }])
          .select()
          .single();
          
        if (!newWalletError) {
          currentWalletId = newWallet.id;
          setBalance(0);
        }
      } else {
        currentWalletId = walletData.id;
        setBalance(walletData.balance);
      }
      
      if (currentWalletId) {
        // Fetch transactions
        const { data: txData } = await supabase
          .from('wallet_transactions')
          .select('*')
          .eq('wallet_id', currentWalletId)
          .order('created_at', { ascending: false });
          
        if (txData) setTransactions(txData);
      }
    } catch (err) {
      console.error('Error fetching wallet:', err);
    }
    setLoading(false);
  };

  const handleRedeem = async (e) => {
    e.preventDefault();
    if (!redeemCode.trim() || !session?.user?.email) return;

    setRedeemStatus(null);
    const code = redeemCode.trim().toUpperCase();

    try {
      // 1. Find the gift card
      const { data: cardData, error: cardError } = await supabase
        .from('gift_cards')
        .select('*')
        .eq('code', code)
        .single();

      if (cardError || !cardData) {
        setRedeemStatus({ type: 'error', message: 'Invalid gift card code.' });
        return;
      }

      if (cardData.is_redeemed) {
        setRedeemStatus({ type: 'error', message: 'This gift card has already been redeemed.' });
        return;
      }

      // 2. Mark as redeemed
      const { error: updateError } = await supabase
        .from('gift_cards')
        .update({
          is_redeemed: true,
          redeemed_by: session.user.email,
          redeemed_at: new Date().toISOString()
        })
        .eq('id', cardData.id);

      if (updateError) throw updateError;

      // 3. Update wallet balance
      // We must get the wallet again to ensure we have the correct ID
      const { data: walletData } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_email', session.user.email)
        .single();

      if (walletData) {
        const newBalance = Number(walletData.balance) + Number(cardData.value);
        
        await supabase
          .from('wallets')
          .update({ balance: newBalance })
          .eq('id', walletData.id);

        // 4. Record transaction
        await supabase
          .from('wallet_transactions')
          .insert([{
            wallet_id: walletData.id,
            type: 'gift_card_redemption',
            amount: cardData.value,
            description: `Redeemed Gift Card: ${code}`
          }]);
          
        setBalance(newBalance);
        setRedeemCode('');
        setRedeemStatus({ type: 'success', message: `Successfully added ${formatPrice(cardData.value)} to your wallet!` });
        fetchWallet(); // refresh tx
      }
    } catch (err) {
      console.error('Error redeeming card:', err);
      setRedeemStatus({ type: 'error', message: 'An error occurred. Please try again.' });
    }
  };

  if (!session) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
        <h3>Please log in to view your wallet.</h3>
        <Link to="/login">Go to Login</Link>
      </div>
    );
  }

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh', fontFamily: '-apple-system, sans-serif' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', background: '#f5f5f5', minHeight: '100vh' }}>
        
        {/* Header */}
        <div style={{ background: '#fff', padding: '16px', display: 'flex', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 }}>
          <Link to="/profile" style={{ color: 'inherit' }}>
            <ChevronLeft size={24} style={{ cursor: 'pointer' }} />
          </Link>
          <h1 style={{ flex: 1, textAlign: 'center', fontSize: '18px', margin: 0 }}>My Wallet</h1>
          <div style={{ width: '24px' }}></div>
        </div>

        {/* Balance Card */}
        <div style={{ background: '#fff', padding: '24px', textAlign: 'center', borderBottom: '1px solid #eee' }}>
          <WalletIcon size={48} style={{ color: '#000', marginBottom: '16px' }} />
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Total Balance</div>
          {loading ? (
            <div style={{ fontSize: '36px', fontWeight: 'bold' }}>...</div>
          ) : (
            <div style={{ fontSize: '36px', fontWeight: 'bold' }}>{formatPrice(balance)}</div>
          )}
        </div>

        {/* Redeem Section */}
        <div style={{ padding: '20px' }}>
          <h2 style={{ fontSize: '16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Gift size={20} /> Redeem Gift Card
          </h2>
          
          <form onSubmit={handleRedeem} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <input 
              type="text" 
              placeholder="Enter Gift Card Code (e.g. WELCOME50)" 
              value={redeemCode}
              onChange={(e) => setRedeemCode(e.target.value)}
              style={{ flex: 1, padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px' }}
            />
            <button 
              type="submit" 
              disabled={!redeemCode.trim()}
              style={{ background: '#000', color: '#fff', border: 'none', padding: '0 20px', borderRadius: '8px', fontWeight: 'bold', cursor: redeemCode.trim() ? 'pointer' : 'not-allowed', opacity: redeemCode.trim() ? 1 : 0.5 }}
            >
              Redeem
            </button>
          </form>

          {redeemStatus && (
            <div style={{ padding: '12px', borderRadius: '8px', fontSize: '14px', background: redeemStatus.type === 'success' ? '#e6ffe6' : '#ffe6e6', color: redeemStatus.type === 'success' ? '#006600' : '#cc0000', marginBottom: '24px' }}>
              {redeemStatus.message}
            </div>
          )}

          {/* Transactions */}
          <h2 style={{ fontSize: '16px', marginBottom: '16px', marginTop: '32px' }}>Recent Transactions</h2>
          {transactions.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#999', padding: '20px' }}>No transactions yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {transactions.map(tx => (
                <div key={tx.id} style={{ background: '#fff', padding: '16px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>{tx.description || tx.type}</div>
                    <div style={{ fontSize: '12px', color: '#999' }}>{new Date(tx.created_at).toLocaleDateString()}</div>
                  </div>
                  <div style={{ fontWeight: 'bold', color: tx.type === 'purchase' || tx.type === 'withdrawal' ? '#ff4444' : '#00aa00' }}>
                    {tx.type === 'purchase' || tx.type === 'withdrawal' ? '-' : '+'}{formatPrice(tx.amount)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Wallet;
