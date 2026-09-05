import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../storage/storage_service.dart';

final localeProvider = StateNotifierProvider<LocaleNotifier, Locale>((ref) {
  return LocaleNotifier();
});

class LocaleNotifier extends StateNotifier<Locale> {
  LocaleNotifier() : super(const Locale('en')) {
    _loadSavedLocale();
  }

  Future<void> _loadSavedLocale() async {
    final lang = await StorageService().getLanguage();
    state = Locale(lang);
  }

  Future<void> setLocale(String langCode) async {
    await StorageService().saveLanguage(langCode);
    state = Locale(langCode);
  }
}

class AppLocalizations {
  final Locale locale;
  AppLocalizations(this.locale);

  static AppLocalizations of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations) ??
        AppLocalizations(const Locale('en'));
  }

  static const _localizedValues = <String, Map<String, String>>{
    'en': {
      'appName': 'KrishiShetra',
      'tagline': 'Apni Fasal, Apna Bazaar, Apna Behtar Daam.',
      'login': 'Login',
      'enterMobile': 'Enter Mobile Number',
      'sendOtp': 'Send OTP',
      'enterOtp': 'Enter 6-Digit OTP',
      'verifyOtp': 'Verify & Login',
      'todayMarket': "Today's Market",
      'quickActions': 'Quick Actions',
      'createLot': 'Create Lot',
      'marketPrices': 'Market Prices',
      'myLots': 'My Lots',
      'offers': 'Offers',
      'aiSellingAdvice': 'AI Selling Advice',
      'buyerOffers': 'Buyer Offers',
      'home': 'Home',
      'market': 'Market',
      'sell': 'Sell',
      'profile': 'Profile',
      'verified': 'Verified',
      'netRealization': 'Net Realization',
      'distance': 'Distance',
      'demand': 'Demand',
      'acceptOffer': 'Accept Offer',
      'rejectOffer': 'Reject Offer',
      'orderTimeline': 'Order Timeline',
      'liveGpsTracking': 'Live GPS Tracking',
      'driverOnTheWay': 'Driver is on the way',
      'paymentReceived': 'Payment Confirmed',
    },
    'hi': {
      'appName': 'कृषिक्षेत्र',
      'tagline': 'अपनी फसल, अपना बाज़ार, अपना बेहतर दाम।',
      'login': 'लॉग इन करें',
      'enterMobile': 'मोबाइल नंबर दर्ज करें',
      'sendOtp': 'ओटीपी भेजें',
      'enterOtp': '६ अंकों का ओटीपी दर्ज करें',
      'verifyOtp': 'सत्यापित करें और लॉग इन करें',
      'todayMarket': 'आज का बाज़ार भाव',
      'quickActions': 'त्वरित कार्य',
      'createLot': 'फसल लॉट बनाएं',
      'marketPrices': 'मंडी भाव',
      'myLots': 'मेरे लॉट',
      'offers': 'खरीदार प्रस्ताव',
      'aiSellingAdvice': 'एआई बिक्री सलाह',
      'buyerOffers': 'खरीदार प्रस्ताव',
      'home': 'होम',
      'market': 'बाज़ार',
      'sell': 'बेचें',
      'profile': 'प्रोफ़ाइल',
      'verified': 'सत्यापित',
      'netRealization': 'शुद्ध प्राप्ति',
      'distance': 'दूरी',
      'demand': 'मांग',
      'acceptOffer': 'प्रस्ताव स्वीकार करें',
      'rejectOffer': 'प्रस्ताव अस्वीकार करें',
      'orderTimeline': 'ऑर्डर की स्थिति',
      'liveGpsTracking': 'लाइव जीपीएस ट्रैकिंग',
      'driverOnTheWay': 'ड्राइवर रास्ते में है',
      'paymentReceived': 'भुगतान की पुष्टि हुई',
    },
    'mr': {
      'appName': 'कृषिक्षेत्र',
      'tagline': 'आपली फसल, आपला बाजार, आपले उत्तम दर.',
      'login': 'लॉगिन करा',
      'enterMobile': 'मोबाईल नंबर टाका',
      'sendOtp': 'ओटीपी पाठवा',
      'enterOtp': '६ अंकी ओटीपी टाका',
      'verifyOtp': 'सत्यापित करा आणि लॉगिन करा',
      'todayMarket': 'आजचे बाजारभाव',
      'quickActions': 'द्रुत क्रिया',
      'createLot': 'पिक लॉट तयार करा',
      'marketPrices': 'बाजार भाव',
      'myLots': 'माझे लॉट्स',
      'offers': 'खरेदीदार ऑफर्स',
      'aiSellingAdvice': 'एआय विक्री सल्ला',
      'buyerOffers': 'खरेदीदार ऑफर्स',
      'home': 'मुख्यपृष्ठ',
      'market': 'बाजार',
      'sell': 'विक्री',
      'profile': 'प्रोफाइल',
      'verified': 'प्रमाणित',
      'netRealization': 'निव्वळ नफा',
      'distance': 'अंतर',
      'demand': 'मागणी',
      'acceptOffer': 'ऑफर स्वीकारा',
      'rejectOffer': 'ऑफर नाकारा',
      'orderTimeline': 'ऑर्डर स्थिती',
      'liveGpsTracking': 'थेट जीपीएस ट्रॅकिंग',
      'driverOnTheWay': 'चालक मार्गावर आहे',
      'paymentReceived': 'पेमेंट यशस्वी झाले',
    }
  };

  String tr(String key) {
    return _localizedValues[locale.languageCode]?[key] ??
        _localizedValues['en']?[key] ??
        key;
  }
}
