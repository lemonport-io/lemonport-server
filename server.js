const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const helmet = require('helmet');
const { web3 } = require('./web3');
const { LOGGER } = require('./config/index');
const UsersRoutes = require('./routes/users');
const AccountsRoutes = require('./routes/accounts');
const EthereumRoutes = require('./routes/ethereum');

const app = express();

app.use(helmet());

app.use(morgan(LOGGER));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/users', UsersRoutes);
app.use('/accounts', AccountsRoutes);
app.use('/ethereum', EthereumRoutes);

app.get('/network', (req, res) => {
  const network = web3.currentProvider.host
    .match(/(https?:\/\/)\w+/gi)[0]
    .replace(/(https?:\/\/)/gi, '');
  res.status(200).json({ network });
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`App started on port ${port}`));
