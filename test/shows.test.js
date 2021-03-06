process.env.NODE_ENV = 'test'

const chai = require('chai')
const should = chai.should()
const chaiHttp = require('chai-http')
const server = require('../app.js')
const knex = require('../db/knex.js')


chai.use(chaiHttp)

describe('API Routes', () => {
  beforeEach((done) => {
    knex.migrate.rollback()
      .then(() => {
        knex.migrate.latest()
          .then(() => {
            return knex.seed.run()
              .then(() => {
                done()
              })
          })
      })
  })
  afterEach((done) => {
    knex.migrate.rollback()
      .then(() => done())
  })
  describe('GET /api/v1/shows', () => {
    it('should return all shows', (done) => {
      chai.request(server)
        .get('/api/v1/shows')
        .end((err, res) => {
          res.should.have.status(200)
          res.should.be.json
          res.body.should.be.a('array')
          res.body.length.should.equal(4)
          res.body[0].should.have.property('name')
          res.body[0].name.should.equal('Suits')
          res.body[0].should.have.property('channel')
          res.body[0].channel.should.equal('USA Network')
          res.body[0].should.have.property('rating')
          res.body[0].rating.should.equal(3)
          res.body[0].should.have.property('explicit')
          res.body[0].explicit.should.equal(false)
          done()
        })
    })
  })
  describe('GET /api/v1/shows/:id', () => {
    it('should return a single show', (done) => {
      chai.request(server)
        .get('/api/v1/shows/1')
        .end((err, res) => {
          res.should.have.status(200)
          res.should.be.json
          res.body.should.be.a('object')
          res.body.should.have.property('name')
          res.body.name.should.equal('Suits')
          res.body.should.have.property('channel')
          res.body.channel.should.equal('USA Network')
          res.body.should.have.property('rating')
          res.body.rating.should.equal(3)
          res.body.should.have.property('genre')
          res.body.genre.should.equal('Drama')
          res.body.should.have.property('explicit')
          res.body.explicit.should.equal(false)
          done()
        })
    })
  })

  describe('POST /api/v1/shows', () => {
    it('should add a show', (done) => {
      chai.request(server)
        .post('/api/v1/shows')
        .send({
          name: 'Family Guy',
          channel: 'Fox',
          genre: 'Comedy',
          rating: 4,
          explicit: true
        })
      .end((err, res) => {
        res.should.have.status(200)
        res.should.be.json
        res.body.should.be.a('object')
        res.body.should.have.property('name')
        res.body.name.should.equal('Family Guy')
        res.body.should.have.property('channel')
        res.body.channel.should.equal('Fox')
        res.body.should.have.property('genre')
        res.body.genre.should.equal('Comedy')
        res.body.should.have.property('explicit')
        res.body.explicit.should.equal(true)
        done()
      })

    })
  })

  describe('PUT /api/v1/shows/:id', () => {
    it('should update a show', (done) => {
      chai.request(server)
        .put('/api/v1/shows/1')
        .send({
          rating: 4,
          explicit: true
        })
      .end((err, res) => {
        res.should.have.status(200)
        res.should.be.json
        res.body.should.be.a('object')
        res.body.should.have.property('name')
        res.body.name.should.equal('Suits')
        res.body.should.have.property('channel')
        res.body.channel.should.equal('USA Network')
        res.body.should.have.property('rating')
        res.body.rating.should.equal(4)
        res.body.should.have.property('genre')
        res.body.genre.should.equal('Drama')
        res.body.should.have.property('explicit')
        res.body.explicit.should.equal(true)
        done()
      })
    })
    it('should not update a show when we add id inside body', (done) => {
      chai.request(server)
        .put('/api/v1/shows/1')
        .send({
          id: 20,
          rating: 4,
          explicit: true
        })
      .end((err, res) => {
        res.should.have.status(422)
        res.should.be.json
        res.body.should.be.a('object')
        res.body.should.have.property('error')
        res.body.error.should.equal('You cannot update the id field')
        done()
      })
    })
  })

  describe('DELETE /api/v1/shows/:id', () => {
    it('should delete a show', (done) => {
      chai.request(server)
        .delete('/api/v1/shows/1')
        .end((err, res) => {
          res.should.have.status(200)
          res.should.be.a.json
          res.body.should.be.a('object')
          res.body.should.have.property('name');
          res.body.name.should.equal('Suits');
          res.body.should.have.property('channel');
          res.body.channel.should.equal('USA Network');
          res.body.should.have.property('genre');
          res.body.genre.should.equal('Drama');
          res.body.should.have.property('rating');
          res.body.rating.should.equal(3);
          res.body.should.have.property('explicit');
          res.body.explicit.should.equal(false);
          chai.request(server)
            .get('/api/v1/shows')
            .end((err, res) => {
              res.should.have.status(200);
              res.should.be.json; // jshint ignore:line
              res.body.should.be.a('array');
              res.body.length.should.equal(3);
              res.body[0].should.have.property('name');
              res.body[0].name.should.equal('Game of Thrones');
              res.body[0].should.have.property('channel');
              res.body[0].channel.should.equal('HBO');
              res.body[0].should.have.property('genre');
              res.body[0].genre.should.equal('Fantasy');
              res.body[0].should.have.property('rating');
              res.body[0].rating.should.equal(4);
              res.body[0].should.have.property('explicit');
              res.body[0].explicit.should.equal(true);
              done();
            })

        })
    })
  })

})
