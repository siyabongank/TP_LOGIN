import express from 'express'; 
import cors from 'cors'; 
import sqlite3 from 'sqlite3'; 
import bcrypt from 'bcryptjs'; 
import jwt from 'jsonwebtoken'; 
 
const app = express(); 
const PORT = 3000; 
const dbPath = './database.sqlite'; 
const SECRET_KEY = 'La_cle_secrete_tres_longue';  
 
// --- Configuration de la BDD SQLite --- 
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, 
(err) => { 
    if (err) console.error('Erreur connexion BDD:', err.message); 
    else console.log('Connecté à SQLite.'); 
}); 
// --- Middlewares --- 
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use(cors()); 

// --- Initialisation (Création table + User admin avec MDP hashé) --- 
function initDataBase() { 
    db.serialize(() => { 
        db.run(`CREATE TABLE IF NOT EXISTS user ( 
            id INTEGER PRIMARY KEY AUTOINCREMENT, 
            login TEXT NOT NULL UNIQUE,  email TEXT NOT NULL, 
            mdp TEXT NOT NULL, firstname TEXT, lastname TEXT 
        )`); 
        // On vérifie si la table est vide ou si l'user existe avant d'insérer 
        // Pour l'exemple, on tente l'insertion sécurisée 
        const insertQuery = `INSERT INTO user (login, email, mdp, firstname, lastname)  
                              VALUES (?, ?, ?, ?, ?)`;         
        // Hachage du mot de passe avant stockage dans la BD 
        const salt = bcrypt.genSaltSync(10); 
        const hashedPassword = bcrypt.hashSync('1234567$', salt);  
        db.run(insertQuery, ['admin','admin@test.com',hashedPassword,'Super','Admin'], function(err) { 
            if (!err) console.log("Utilisateur 'admin' créé.");             
        }); 
    }); 
} 
initDataBase();// Appel de l'initialisation au démarrage 
// --- Route Login (Traitement, Validation, Auth, Token) --- 
app.post('/login', (req, res) => { 
    const { username, password } = req.body; 
 
    // 1. Validation des entrées basique 
    if (!username || !password) { 
        return res.status(400).json({ message: "Username et password requis." }); 
    } 
    // 2. Recherche de l'utilisateur en base 
    const sql = "SELECT * FROM user WHERE login = ?"; 
    db.get(sql, [username], (err, user) => { 
        if (err) return res.status(500).json({ message: "Erreur serveur." });         
        // 3. Authentification 
        if (!user) { 
            return res.status(401).json({ message: "Utilisateur inconnu." }); 
        } 
        // Comparaison du mot de passe reçu avec le hash en BDD 
        const isMatch = bcrypt.compareSync(password, user.mdp);         
        if (!isMatch) { 
            return res.status(401).json({ message: "Mot de passe incorrect." }); 
        } 
        // 4. Génération du Token (Session) 
        // Le payload contient les infos utiles (id, login, etc.) 
        const token = jwt.sign( 
            {id:user.id,login:user.login},SECRET_KEY,{expiresIn:'1h'} // token expire dans 1 heure 
        ); 
        return res.json({  
            message: "Connexion réussie",  
            token: token, 
            user: { 
                firstname: user.firstname, 
                lastname: user.lastname 
            } 
        }); 
    }); 
}); 
app.listen(PORT,()=>{console.log(`Serveur démarré sur http://localhost:${PORT}`);});