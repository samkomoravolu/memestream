import React, { useState } from 'react';

function ShareButton({ photo, url }) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Detect device type
  const isAppleDevice = /iPad|iPhone|iPod|Mac/.test(navigator.userAgent);
  const isAndroidDevice = /Android/.test(navigator.userAgent);
  
  // Get current page URL
  const currentUrl = url || window.location.href;
  const shareText = `Check out this funny meme: ${photo?.name || 'MemeStream'}`;
  
  // Share options based on device
  const getShareOptions = () => {
    if (isAppleDevice) {
      return [
        { name: 'iMessage', icon: '💬', action: () => shareToIMessage() },
        { name: 'WhatsApp', icon: '📱', action: () => shareToWhatsApp() },
        { name: 'Instagram', icon: '📸', action: () => shareToInstagram() },
        { name: 'Facebook', icon: '👥', action: () => shareToFacebook() },
        { name: 'Snapchat', icon: '👻', action: () => shareToSnapchat() },
        { name: 'TikTok', icon: '🎵', action: () => shareToTikTok() },
        { name: 'Twitter', icon: '🐦', action: () => shareToTwitter() },
        { name: 'Email', icon: '📧', action: () => shareToEmail() },
        { name: 'Google Chat', icon: '💬', action: () => shareToGoogleChat() },
        { name: 'Copy Link', icon: '🔗', action: () => copyToClipboard() }
      ];
    } else if (isAndroidDevice) {
      return [
        { name: 'WhatsApp', icon: '📱', action: () => shareToWhatsApp() },
        { name: 'Instagram', icon: '📸', action: () => shareToInstagram() },
        { name: 'Facebook', icon: '👥', action: () => shareToFacebook() },
        { name: 'Twitter', icon: '🐦', action: () => shareToTwitter() },
        { name: 'TikTok', icon: '🎵', action: () => shareToTikTok() },
        { name: 'Snapchat', icon: '👻', action: () => shareToSnapchat() },
        { name: 'Email', icon: '📧', action: () => shareToEmail() },
        { name: 'Google Chat', icon: '💬', action: () => shareToGoogleChat() },
        { name: 'Copy Link', icon: '🔗', action: () => copyToClipboard() }
      ];
    } else {
      // Desktop/other devices
      return [
        { name: 'WhatsApp', icon: '📱', action: () => shareToWhatsApp() },
        { name: 'Instagram', icon: '📸', action: () => shareToInstagram() },
        { name: 'Facebook', icon: '👥', action: () => shareToFacebook() },
        { name: 'Twitter', icon: '🐦', action: () => shareToTwitter() },
        { name: 'TikTok', icon: '🎵', action: () => shareToTikTok() },
        { name: 'Email', icon: '📧', action: () => shareToEmail() },
        { name: 'Google Chat', icon: '💬', action: () => shareToGoogleChat() },
        { name: 'Copy Link', icon: '🔗', action: () => copyToClipboard() }
      ];
    }
  };

  // Share functions
  const shareToIMessage = () => {
    const message = `${shareText}\n${currentUrl}`;
    window.open(`sms:&body=${encodeURIComponent(message)}`, '_blank');
  };

  const shareToWhatsApp = () => {
    const message = `${shareText}\n${currentUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const shareToInstagram = () => {
    // Instagram doesn't support direct sharing, so we'll copy the link
    copyToClipboard();
    alert('Link copied! You can now paste it in your Instagram story or post.');
  };

  const shareToFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}&quote=${encodeURIComponent(shareText)}`, '_blank');
  };

  const shareToTwitter = () => {
    const message = `${shareText}\n${currentUrl}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`, '_blank');
  };

  const shareToTikTok = () => {
    // TikTok doesn't support direct sharing, so we'll copy the link
    copyToClipboard();
    alert('Link copied! You can now paste it in your TikTok video description.');
  };

  const shareToSnapchat = () => {
    // Snapchat doesn't support direct sharing, so we'll copy the link
    copyToClipboard();
    alert('Link copied! You can now paste it in your Snapchat story.');
  };

  const shareToEmail = () => {
    const subject = 'Check out this funny meme!';
    const body = `${shareText}\n\n${currentUrl}\n\nShared from MemeStream`;
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
  };

  const shareToGoogleChat = () => {
    // Google Chat doesn't support direct sharing, so we'll copy the link
    copyToClipboard();
    alert('Link copied! You can now paste it in your Google Chat message.');
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      alert('Link copied to clipboard!');
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = currentUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Link copied to clipboard!');
    }
  };

  const shareOptions = getShareOptions();

  return (
    <div className="share-container">
      <button 
        className="btn btn-share"
        onClick={() => setIsOpen(!isOpen)}
      >
        📤 Share
      </button>
      
      {isOpen && (
        <div className="share-dropdown">
          <div className="share-header">
            <h4>Share this meme</h4>
            <button 
              className="close-btn"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
          </div>
          
          <div className="share-options">
            {shareOptions.map((option, index) => (
              <button
                key={index}
                className="share-option"
                onClick={() => {
                  option.action();
                  setIsOpen(false);
                }}
              >
                <span className="share-icon">{option.icon}</span>
                <span className="share-name">{option.name}</span>
              </button>
            ))}
          </div>
          
          <div className="share-footer">
            <small>
              {isAppleDevice ? '🍎 Apple optimized' : isAndroidDevice ? '🤖 Android optimized' : '💻 Desktop view'}
            </small>
          </div>
        </div>
      )}
    </div>
  );
}

export default ShareButton;
