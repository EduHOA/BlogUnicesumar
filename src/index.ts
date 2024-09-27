import express, {Request, Response} from "express";
import mysql from "mysql2/promise";


const app = express();

// Configura EJS como a engine de renderização de templates
app.set('view engine', 'ejs');
app.set('views', `${__dirname}/views`);

const connection = mysql.createPool({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "mudar123",
    database: "unicesumar"
});

// Middleware para permitir dados no formato JSON
app.use(express.json());
// Middleware para permitir dados no formato URLENCODED
app.use(express.urlencoded({ extended: true }));


// gets

app.get('/users', async function (req: Request, res: Response) {
    const [rows] = await connection.query("SELECT * FROM users");
    return res.render('users/login', {
        users: rows
    });
});

app.get("/users/form", async function (req: Request, res: Response) {
    return res.render("users/form");
});

app.get("/users/formlogin", async function (req: Request, res: Response) {
    return res.render("users/formLogin");
});

app.get("/users/login", async function(req:Request, res: Response) {
    return res.render("users/index");
})

app.get("/users/edit/:id", async function (req: Request, res: Response) {
    const {id} = req.params;
    
        const [check] = await connection.query(
            "SELECT * FROM users WHERE id = ?",
            [id]
        );

        if (!check) {
            return res.status(404).json({ message: "Usuário não encontrado" });
        }

        res.render("users/formEdit", { user: check[0]});
    
});

app.get('/users/list', async function (req: Request, res: Response) {
    const [rows] = await connection.query("SELECT * FROM users");
    return res.render('users/index', {users: rows});
});

app.get('/users/posts', async function (req: Request, res: Response) {
    return res.render("users/posts");
});




//Posts

app.post("/users/save", async function (req: Request, res: Response) {
    const { name, email, position, password, confirmPassword, isActive } = req.body;

    if (password !== confirmPassword) {
        return res.status(400).send('Senhas não conferem. Volte e Tente novamente.');
    }

    let activeStatus = 0;  
    if (isActive === 'true') {
        activeStatus = 1;  
    }

    const insertQuery = "INSERT INTO users (name, email, position, password, active) VALUES (?, ?, ?, ?, ?)";
    try {
        await connection.query(insertQuery, [name, email, position, password, activeStatus]);

        res.redirect("/users/list");

    } catch (err) {
        res.status(500).send("Erro ao salvar o usuário.");
    }
});

app.post("/users/delete/:id", async function (req: Request, res: Response) {
    const id = req.params.id;
    const sqlDelete = "DELETE FROM users WHERE id = ?";
    await connection.query(sqlDelete, [id]);

    res.redirect("/users/list");
});

app.post("/users/login", async function (req: Request, res: Response){
    const {email,password} = req.body;

    try {
        // 1. Buscar o usuário pelo email e senha no banco de dados
        const [rows]: any = await connection.query(
            "SELECT * FROM users WHERE email = ? AND password = ?",
            [email, password]
        );

        // Verificar se encontrou o usuário (checando se `rows` contém resultados)
        if (rows.length === 0) {
            return res.status(400).json({ message: 'Usuário ou senha incorretos' });
        }

        // Se o usuário foi encontrado, redirecionar para a listagem de usuários
        res.redirect("/users/list");

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erro no servidor' });
    }
});

app.post("/users/edit/:id", async function (req: Request, res: Response) {
    const {id} = req.params;  
    const body = req.body; 

    let activeStatus = 0;  
    if (body.isActive === 'true') {
        activeStatus = 1;   
    }

        const sqlUpdate = "UPDATE users SET name = ?, email = ?, position = ?, password = ?, active = ? WHERE id = ?";
        await connection.query(sqlUpdate, [body.name, body.email, body.position, body.password, activeStatus, id]);

        res.redirect("/users/list");
});

app.post("/users/savelogin", async function (req: Request, res: Response) {
    const { name, email, position, password, confirmPassword, isActive } = req.body;

    if (password !== confirmPassword) {
        return res.status(400).send('Senhas não conferem. Volte e Tente novamente.');
    }

    let activeStatus = 0;  
    if (isActive === 'true') {
        activeStatus = 1;  
    }

    const insertQuery = "INSERT INTO users (name, email, position, password, active) VALUES (?, ?, ?, ?, ?)";
    try {
        await connection.query(insertQuery, [name, email, position, password, activeStatus]);

        res.redirect("/users");

    } catch (err) {
        res.status(500).send("Erro ao salvar o usuário.");
    }
});

app.listen('3000', () => console.log("Server is listening on port 3000"));