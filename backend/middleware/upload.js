// // backend/middleware/upload.js
// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');

// // Configuration du stockage
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     const uploadPath = path.join(__dirname, '../uploads');
    
//     // Créer le dossier s'il n'existe pas
//     if (!fs.existsSync(uploadPath)) {
//       fs.mkdirSync(uploadPath, { recursive: true });
//     }
    
//     cb(null, uploadPath);
//   },
//   filename: function (req, file, cb) {
//     // Générer un nom unique pour le fichier
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//     cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
//   }
// });

// // Filtrer les types de fichiers autorisés
// const fileFilter = (req, file, cb) => {
//   // Types de fichiers autorisés
//   const allowedTypes = [
//     'image/jpeg',
//     'image/jpg', 
//     'image/png',
//     'image/gif',
//     'application/pdf',
//     'application/msword',
//     'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
//   ];
  
//   if (allowedTypes.includes(file.mimetype)) {
//     cb(null, true);
//   } else {
//     cb(new Error('Type de fichier non autorisé'), false);
//   }
// };

// // Configuration de multer
// const upload = multer({
//   storage: storage,
//   fileFilter: fileFilter,
//   limits: {
//     fileSize: 5 * 1024 * 1024 // Limite de 5MB
//   }
// });

// module.exports = upload;
// backend/middleware/upload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Créer les dossiers s'ils n'existent pas
const createDirectories = () => {
  const dirs = ['uploads', 'uploads/medical', 'uploads/profiles'];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

createDirectories();

// Configuration du stockage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = 'uploads/';
    
    // Déterminer le dossier selon le type de fichier
    if (req.route.path.includes('/files')) {
      uploadPath += 'medical/';
    } else if (req.route.path.includes('/profile')) {
      uploadPath += 'profiles/';
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Générer un nom unique
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  }
});

// Filtre des types de fichiers
const fileFilter = (req, file, cb) => {
  // Types autorisés pour les fichiers médicaux
  const allowedMimes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Type de fichier non autorisé'), false);
  }
};

// Configuration multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max
  }
});

module.exports = upload;