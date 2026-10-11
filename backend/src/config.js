module.exports = {
    database: {
        host: process.env.DATABASE_HOST || "localhost",
        port: process.env.DATABASE_PORT || 3306,
        database: process.env.DATABASE_DB,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD
    },
    port: process.env.PORT || 8080
};