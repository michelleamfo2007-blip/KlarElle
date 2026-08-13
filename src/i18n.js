import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  EN: {
    translation: {
      "Free shipping on orders over": "Free shipping on orders over",
      "NEW IN": "NEW IN",
      "DRESSES": "DRESSES",
      "TOPS": "TOPS",
      "BOTTOMS": "BOTTOMS",
      "ACCESSORIES": "ACCESSORIES",
      "SALE": "SALE",
      "Cart": "Cart",
      "Shopping Bag": "Shopping Bag",
      "Search": "Search",
      "Track Order": "Track Order",
      "Check In": "Check In",
      "Customer Care": "Customer Care",
      "Shipping Info": "Shipping Info",
      "Returns & Exchanges": "Returns & Exchanges",
      "FAQ": "FAQ",
      "About Us": "About Us",
      "Our Story": "Our Story",
      "Sustainability": "Sustainability",
      "Careers": "Careers",
      "Legal": "Legal",
      "Terms of Service": "Terms of Service",
      "Privacy Policy": "Privacy Policy"
    }
  },
  FR: {
    translation: {
      "Free shipping on orders over": "Livraison gratuite pour les commandes de plus de",
      "NEW IN": "NOUVEAUTÉS",
      "DRESSES": "ROBES",
      "TOPS": "HAUTS",
      "BOTTOMS": "BAS",
      "ACCESSORIES": "ACCESSOIRES",
      "SALE": "SOLDES",
      "Cart": "Panier",
      "Shopping Bag": "Panier d'achat",
      "Search": "Recherche",
      "Track Order": "Suivi de commande",
      "Check In": "Enregistrement",
      "Customer Care": "Service client",
      "Shipping Info": "Livraison",
      "Returns & Exchanges": "Retours",
      "FAQ": "FAQ",
      "About Us": "À propos",
      "Our Story": "Notre histoire",
      "Sustainability": "Durabilité",
      "Careers": "Emplois",
      "Legal": "Légal",
      "Terms of Service": "Conditions d'utilisation",
      "Privacy Policy": "Confidentialité"
    }
  },
  ES: {
    translation: {
      "Free shipping on orders over": "Envío gratis en pedidos superiores a",
      "NEW IN": "NOVEDADES",
      "DRESSES": "VESTIDOS",
      "TOPS": "TOPS",
      "BOTTOMS": "PANTALONES",
      "ACCESSORIES": "ACCESORIOS",
      "SALE": "REBAJAS",
      "Cart": "Carrito",
      "Shopping Bag": "Bolsa de compras",
      "Search": "Buscar",
      "Track Order": "Seguir pedido",
      "Check In": "Registro",
      "Customer Care": "Atención al cliente",
      "Shipping Info": "Envíos",
      "Returns & Exchanges": "Devoluciones",
      "FAQ": "Preguntas Frecuentes",
      "About Us": "Sobre nosotros",
      "Our Story": "Nuestra historia",
      "Sustainability": "Sostenibilidad",
      "Careers": "Empleo",
      "Legal": "Legal",
      "Terms of Service": "Términos de Servicio",
      "Privacy Policy": "Privacidad"
    }
  },
  DE: {
    translation: {
      "Free shipping on orders over": "Kostenloser Versand für Bestellungen über",
      "NEW IN": "NEU EINGETROFFEN",
      "DRESSES": "KLEIDER",
      "TOPS": "OBERTEILE",
      "BOTTOMS": "HOSEN",
      "ACCESSORIES": "ACCESSOIRES",
      "SALE": "SALE",
      "Cart": "Warenkorb",
      "Shopping Bag": "Einkaufstasche",
      "Search": "Suche",
      "Track Order": "Bestellung verfolgen",
      "Check In": "Einchecken",
      "Customer Care": "Kundendienst",
      "Shipping Info": "Versand",
      "Returns & Exchanges": "Rückgaben",
      "FAQ": "FAQ",
      "About Us": "Über uns",
      "Our Story": "Unsere Geschichte",
      "Sustainability": "Nachhaltigkeit",
      "Careers": "Karriere",
      "Legal": "Rechtliches",
      "Terms of Service": "Nutzungsbedingungen",
      "Privacy Policy": "Datenschutz"
    }
  },
  IT: {
    translation: {
      "Free shipping on orders over": "Spedizione gratuita per ordini superiori a",
      "NEW IN": "NUOVI ARRIVI",
      "DRESSES": "ABITI",
      "TOPS": "TOP",
      "BOTTOMS": "PANTALONI",
      "ACCESSORIES": "ACCESSORI",
      "SALE": "SALDI",
      "Cart": "Carrello",
      "Shopping Bag": "Borsa della spesa",
      "Search": "Cerca",
      "Track Order": "Traccia ordine",
      "Check In": "Check-in",
      "Customer Care": "Servizio clienti",
      "Shipping Info": "Spedizioni",
      "Returns & Exchanges": "Resi",
      "FAQ": "FAQ",
      "About Us": "Chi siamo",
      "Our Story": "La nostra storia",
      "Sustainability": "Sostenibilità",
      "Careers": "Lavora con noi",
      "Legal": "Note legali",
      "Terms of Service": "Termini di servizio",
      "Privacy Policy": "Privacy"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "EN", 
    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;
