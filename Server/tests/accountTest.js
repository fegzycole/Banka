/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-undef */
import chai from 'chai';

import chaiHttp from 'chai-http';

import app from '../app';

const { expect } = chai;

chai.use(chaiHttp);


let UserToken = '';
let adminToken = '';
let cashierToken = '';
describe(' Accounts test for - POST, PATCH, DELETE', () => {
  before((done) => {
    const user = {
      email: 'sobed2smile@gmail.com',
      password: 'password2',
    };
    chai
      .request(app)
      .post('/api/v1/auth/signin')
      .send(user)
      .end((err, res) => {
        const { body } = res;
        expect(body.status).to.be.equals(200);
        if (!err) {
          UserToken = body.data.token;
        }
        done();
      });
  });
  describe('POST api/v1/accounts', () => {
    it('it should throw error when account type is not specified', (done) => {
      chai
        .request(app)
        .post('/api/v1/accounts')
        .send({
          type: '',
          token: UserToken,
        })
        .end((err, res) => {
          const { body } = res;
          expect(body.status).to.be.equals(400);
          expect(body).to.be.an('object');
          expect(body.message).to.be.equals('Enter An Account Type Please');
          done();
        });
    });
  });
  describe('PATCH /accounts/:accountNumber', () => {
    it('it should throw permission error if user is not an admin', (done) => {
      const accountNumber = 3089298272728;
      chai
        .request(app)
        .patch(`/api/v1/accounts/${accountNumber}`)
        .send({
          token: UserToken,
        })
        .end((err, res) => {
          const { body } = res;
          expect(body.status).to.be.equals(401);
          expect(body).to.be.an('object');
          expect(body.error).to.be.equals('You do not have the rights to this resource');
          done();
        });
    });
    before('Sign in as an admin ', (done) => {
      const userCredential = {
        email: 'fergusoniyara@gmail.com', // Admin account
        password: 'somepassword',
      };

      chai
        .request(app)
        .post('/api/v1/auth/signin')
        .send(userCredential)
        .end((err, res) => {
          const { body } = res;
          expect(body.status).to.be.equals(200);
          if (!err) {
            adminToken = body.data.token;
          }
          done();
        });
    });
    it('it should activate or deactivate a user bank account', (done) => {
      const accountNumber = 2004556789;
      chai
        .request(app)
        .patch(`/api/v1/accounts/${accountNumber}`)
        .set('x-access-token', adminToken)
        .send({ status: 'active' })
        .end((err, res) => {
          const { body } = res;
          expect(body.status).to.be.equals(200);
          expect(body).to.be.an('object');
          expect(body.data).to.haveOwnProperty('accountNo');
          expect(body.data).to.haveOwnProperty('status');
          done();
        });
    });
    it('it should throw an error when account number is not in the database', (done) => {
      const accountNumber = 60987655432;
      chai
        .request(app)
        .patch(`/api/v1/accounts/${accountNumber}`)
        .set('x-access-token', adminToken)
        .end((err, res) => {
          const { body } = res;
          expect(body.status).to.be.equals(404);
          expect(body).to.be.an('object');
          expect(body.message).to.be.equals('Account not found');
          done();
        });
    });
  });
  describe('DELETE /accounts/:accountNumber', () => {
    it('it should throw permission error if user is not an admin or staff', (done) => {
      const accountNumber = 3089298272728;
      chai
        .request(app)
        .delete(`/api/v1/accounts/${accountNumber}`)
        .set('x-access-token', UserToken)
        .end((err, res) => {
          const { body } = res;
          expect(body.status).to.be.equals(401);
          expect(body).to.be.an('object');
          expect(body.error).to.be.equals('You do not have the rights to this resource');
          done();
        });
    });
    it('it should throw an error when account number is not found', (done) => {
      const accountNumber = 7091393838393;
      chai
        .request(app)
        .delete(`/api/v1/accounts/${accountNumber}`)
        .set('x-access-token', adminToken)
        .end((err, res) => {
          const { body } = res;
          expect(body.status).to.be.equals(404);
          expect(body).to.be.an('object');
          expect(body.error).to.be.equals('Account not found');
          done();
        });
    });
    it('it should delete a user bank account if everything checks fine', (done) => {
      const accountNumber = 23826726278829;
      chai
        .request(app)
        .delete(`/api/v1/accounts/${accountNumber}`)
        .set('x-access-token', adminToken)
        .end((err, res) => {
          const { body } = res;
          expect(body.status).to.be.equals(200);
          expect(body).to.be.an('object');
          expect(body.message).to.be.equals('Account deleted successfully');
          done();
        });
    });
  });
  before('Sign in as a staff ', (done) => {
    const userCredential = {
      email: 'mfontana@gmail.com',
      password: 'daysOfYourLife',
    };

    chai
      .request(app)
      .post('/api/v1/auth/signin')
      .send(userCredential)
      .end((err, res) => {
        const { body } = res;
        expect(body.status).to.be.equals(200);
        if (!err) {
          cashierToken = body.data.token;
        }
        done();
      });
  });
  it('it should activate or deactivate a user bank account', (done) => {
    const accountNumber = 3089298272728;
    chai
      .request(app)
      .patch(`/api/v1/accounts/${accountNumber}`)
      .set('x-access-token', cashierToken)
      .send({ status: 'active' })
      .end((err, res) => {
        const { body } = res;
        expect(body.status).to.be.equals(200);
        expect(body).to.be.an('object');
        expect(body.data).to.haveOwnProperty('accountNo');
        expect(body.data).to.haveOwnProperty('status');
        done();
      });
  });
  // it('it should delete a user bank account if everything checks fine', (done) => {
  //   const accountNumber = 3089298272728;
  //   chai
  //     .request(app)
  //     .delete(`/api/v1/accounts/${accountNumber}`)
  //     .set('x-access-token', cashierToken)
  //     .end((err, res) => {
  //       const { body } = res;
  //       expect(body.status).to.be.equals(200);
  //       expect(body).to.be.an('object');
  //       expect(body.message).to.be.equals('Account deleted successfully');
  //       done();
  //     });
  // });
});

describe(' Accounts test for - POST, PATCH, DELETE', () => {
  before((done) => {
    const user = {
      email: 'fegorson@gmail.com',
      password: 'somepassword1',
    };
    chai
      .request(app)
      .post('/api/v2/auth/signin')
      .send(user)
      .end((err, res) => {
        const { body } = res;
        expect(body.status).to.be.equals(200);
        if (!err) {
          UserToken = body.data.token;
        }
        done();
      });
  });
  describe('POST api/v2/accounts', () => {
    it('it should throw error when account type is not specified', (done) => {
      chai
        .request(app)
        .post('/api/v2/accounts')
        .send({
          type: '',
          token: UserToken,
        })
        .end((err, res) => {
          const { body } = res;
          expect(body.status).to.be.equals(400);
          expect(body).to.be.an('object');
          expect(body.error).to.be.equals('This field is required, Account type can only be savings or current');
          done();
        });
    });
  });
  describe('PATCH /accounts/:accountNumber', () => {
    it('it should throw permission error if user is not an admin', (done) => {
      const accountNumber = 3089298272728;
      chai
        .request(app)
        .patch(`/api/v2/accounts/${accountNumber}`)
        .send({
          token: UserToken,
        })
        .end((err, res) => {
          const { body } = res;
          expect(body.status).to.be.equals(401);
          expect(body).to.be.an('object');
          expect(body.error).to.be.equals('You do not have the rights to this resource');
          done();
        });
    });
    before('Sign in as an admin ', (done) => {
      const userCredential = {
        email: 'fegzycole@gmail.com', // Admin account
        password: 'somepassword1',
      };

      chai
        .request(app)
        .post('/api/v2/auth/signin')
        .send(userCredential)
        .end((err, res) => {
          const { body } = res;
          expect(body.status).to.be.equals(200);
          if (!err) {
            adminToken = body.data.token;
          }
          done();
        });
    });
    it('it should activate or deactivate a user bank account', (done) => {
      const accountNumber = 20000005;
      chai
        .request(app)
        .patch(`/api/v2/accounts/${accountNumber}`)
        .set('x-access-token', adminToken)
        .send({ status: 'active' })
        .end((err, res) => {
          const { body } = res;
          expect(body.status).to.be.equals(200);
          expect(body).to.be.an('object');
          expect(body.data).to.haveOwnProperty('accountNo');
          expect(body.data).to.haveOwnProperty('status');
          done();
        });
    });
    it('it should throw an error when account number is not in the database', (done) => {
      const accountNumber = 60987655432;
      chai
        .request(app)
        .patch(`/api/v2/accounts/${accountNumber}`)
        .set('x-access-token', adminToken)
        .end((err, res) => {
          const { body } = res;
          expect(body.status).to.be.equals(422);
          expect(body).to.be.an('object');
          expect(body.error).to.be.equals('Account Not Found');
          done();
        });
    });
  });
  describe('DELETE /accounts/:accountNumber', () => {
    it('it should throw permission error if user is not an admin or staff', (done) => {
      const accountNumber = 20000087788725;
      chai
        .request(app)
        .delete(`/api/v2/accounts/${accountNumber}`)
        .set('x-access-token', UserToken)
        .end((err, res) => {
          const { body } = res;
          expect(body.status).to.be.equals(401);
          expect(body).to.be.an('object');
          expect(body.error).to.be.equals('You do not have the rights to this resource');
          done();
        });
    });
    it('it should throw an error when account number is not found', (done) => {
      const accountNumber = 7091393838393;
      chai
        .request(app)
        .delete(`/api/v2/accounts/${accountNumber}`)
        .set('x-access-token', adminToken)
        .end((err, res) => {
          const { body } = res;
          expect(body.status).to.be.equals(422);
          expect(body).to.be.an('object');
          expect(body.error).to.be.equals('Account Not Found');
          done();
        });
    });
    it('it should delete a user bank account if everything checks fine', (done) => {
      const accountNumber = 20000022;
      chai
        .request(app)
        .delete(`/api/v2/accounts/${accountNumber}`)
        .set('x-access-token', adminToken)
        .end((err, res) => {
          const { body } = res;
          expect(body.status).to.be.equals(200);
          expect(body).to.be.an('object');
          expect(body.message).to.be.equals('Account deleted successfully');
          done();
        });
    });
  });
  before('Sign in as a staff ', (done) => {
    const userCredential = {
      email: 'fereoomee@gmail.com',
      password: 'somepassword1',
    };
    chai
      .request(app)
      .post('/api/v2/auth/signin')
      .send(userCredential)
      .end((err, res) => {
        const { body } = res;
        expect(body.status).to.be.equals(200);
        if (!err) {
          cashierToken = body.data.token;
        }
        done();
      });
  });
  it('it should activate or deactivate a user bank account', (done) => {
    const accountNumber = 20000005;
    chai
      .request(app)
      .patch(`/api/v2/accounts/${accountNumber}`)
      .set('x-access-token', cashierToken)
      .send({ status: 'active' })
      .end((err, res) => {
        const { body } = res;
        expect(body.status).to.be.equals(200);
        expect(body).to.be.an('object');
        expect(body.data).to.haveOwnProperty('accountNo');
        expect(body.data).to.haveOwnProperty('status');
        done();
      });
  });
  it('it should delete a user bank account if everything checks fine', (done) => {
    const accountNumber = 20000022;
    chai
      .request(app)
      .delete(`/api/v2/accounts/${accountNumber}`)
      .set('x-access-token', cashierToken)
      .end((err, res) => {
        const { body } = res;
        expect(body.status).to.be.equals(200);
        expect(body).to.be.an('object');
        expect(body.message).to.be.equals('Account deleted successfully');
        done();
      });
  });
  describe('GET api/v2/accounts/accountnumber/transactions', () => {
    before((done) => {
      const user = {
        email: 'fegorson@gmail.com',
        password: 'somepassword1',
      };
      chai
        .request(app)
        .post('/api/v2/auth/signin')
        .send(user)
        .end((err, res) => {
          const { body } = res;
          expect(body.status).to.be.equals(200);
          if (!err) {
            UserToken = body.data.token;
          }
          done();
        });
    });
    it('Should throw an error if the account number does not exist', (done) => {
      const accountNumber = 200000766;
      chai
        .request(app)
        .get(`/api/v2/accounts/${accountNumber}/transactions`)
        .set('x-access-token', UserToken)
        .end((err, res) => {
          expect(res.body.status).to.be.equals(422);
          expect(res.body.error).to.be.equals('Account Not Found');
          done();
        });
    });
    it('Should return a list of all transactions for a particular account', (done) => {
      const accountNumber = 20000006;
      chai
        .request(app)
        .get(`/api/v2/accounts/${accountNumber}/transactions`)
        .set('x-access-token', UserToken)
        .end((err, res) => {
          expect(res.body.status).to.be.equals(200);
          expect(res.body.data).to.be.an('array');
          done();
        });
    });
  });
  describe('GET api/v2/accounts/accountnumber', () => {
    before((done) => {
      const user = {
        email: 'fegorson@gmail.com',
        password: 'somepassword1',
      };
      chai
        .request(app)
        .post('/api/v2/auth/signin')
        .send(user)
        .end((err, res) => {
          const { body } = res;
          expect(body.status).to.be.equals(200);
          if (!err) {
            UserToken = body.data.token;
          }
          done();
        });
    });
    it('Should throw an error if the account number does not exist', (done) => {
      const accountNumber = 200000766;
      chai
        .request(app)
        .get(`/api/v2/accounts/${accountNumber}`)
        .set('x-access-token', UserToken)
        .end((err, res) => {
          expect(res.body.status).to.be.equals(422);
          expect(res.body.error).to.be.equals('Account Not Found');
          done();
        });
    });
    it('Should return a list of all transactions for a particular account', (done) => {
      const accountNumber = 20000006;
      chai
        .request(app)
        .get(`/api/v2/accounts/${accountNumber}`)
        .set('x-access-token', UserToken)
        .end((err, res) => {
          expect(res.body.status).to.be.equals(200);
          expect(res.body.data).to.be.an('object');
          done();
        });
    });
  });
});
