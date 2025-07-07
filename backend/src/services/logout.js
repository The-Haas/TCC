const logoutCliente = (req) => {
    return new Promise((resolve, reject) => {
        req.session.destroy((err) => {
            if (err) {
                return reject(new Error('Erro ao encerrar a sessão'));
            }
            resolve();
        });
    });
};

module.exports = {
    logoutCliente,
};
