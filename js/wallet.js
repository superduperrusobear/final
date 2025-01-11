class WalletManager {
    constructor() {
        this.connection = new solanaWeb3.Connection(
            'https://api.devnet.solana.com',
            'confirmed'
        );
        this.wallet = null;
        this.setupEventListeners();
    }

    setupEventListeners() {
        const connectButton = document.getElementById('connect-wallet');
        connectButton.addEventListener('click', () => this.connectWallet());
    }

    async connectWallet() {
        try {
            if (!window.solana) {
                this.updateStatus('Please install Phantom Wallet!', 'error');
                return;
            }

            const response = await window.solana.connect();
            this.wallet = response.publicKey;
            this.updateStatus(`Connected: ${this.wallet.toString().slice(0, 8)}...`);
            this.updateBalance();
        } catch (error) {
            this.updateStatus('Connection failed: ' + error.message, 'error');
        }
    }

    async updateBalance() {
        if (!this.wallet) return;

        try {
            const balance = await this.connection.getBalance(this.wallet);
            const solBalance = balance / solanaWeb3.LAMPORTS_PER_SOL;
            document.getElementById('sol-balance').textContent = `Balance: ${solBalance.toFixed(4)} SOL`;
        } catch (error) {
            console.error('Failed to fetch balance:', error);
        }
    }

    updateStatus(message, type = 'success') {
        const statusEl = document.getElementById('wallet-status');
        statusEl.textContent = message;
        statusEl.style.color = type === 'error' ? '#ff4444' : '#14F195';
    }

    getWalletAddress() {
        return this.wallet ? this.wallet.toString() : null;
    }
}

// Initialize wallet manager
window.walletManager = new WalletManager(); 