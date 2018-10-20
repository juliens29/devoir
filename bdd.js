const SQLITE3 = require('sqlite3').verbose()
//création d'une base temporaire en mémoire
//let db = new SQLITE3.Database(':memory:')
let db = new SQLITE3.Database('devoirs.db')

db.serialize(()=>{
//création d'une table
    db.run("CREATE TABLE IF NOT EXISTS categories (id, libelle)")
    db.run("CREATE TABLE IF NOT EXISTS collection (id INTEGER, libelle, permanente)")
    db.run("CREATE TABLE IF NOT EXISTS oeuvre (id, titre, id_collection INTEGER, id_categorie INTEGER)")

//requête préparée
    let requete_categorie = db.prepare("INSERT INTO categories VALUES (?,?)")
    let requete_collection = db.prepare("INSERT INTO collection VALUES (?,?,?)")
    let requete_oeuvre = db.prepare("INSERT INTO oeuvre VALUES (?,?,?,?)")

//datas


    let categories = [
        {id: 1, libelle: 'Peinture'},
        {id: 2, libelle: 'Sculpture'},
        {id: 3, libelle: 'Ravioli'}

    ]

    let collection = [
        {id: 1, libelle: 'Art oriental',permanente: 1},
        {id: 2, libelle: 'Art nouveau',permanente: 1},
        {id: 3, libelle: 'Art moderne',permanente: 1},
        {id: 4, libelle: 'Art moderne test',permanente: 0},
        {id: 5, libelle: 'Art pas moderne test',permanente: 0}
    ]

    let oeuvre = [
        {id: 1, titre: 'Haricot perdu au pied dun ceriser',id_collection: 1,id_categorie:1},
        {id: 2, titre: 'ki',id_collection: 1,id_categorie:2},
        {id: 3, titre: 'le chapiteau dresse',id_collection: 2,id_categorie:1},
        {id: 4, titre: 'de bon matin',id_collection: 2,id_categorie:2},
        {id: 5, titre: 'street art on plate',id_collection: 3,id_categorie:1},
        {id: 6, titre: 'plat de pattes',id_collection: 1,id_categorie:3},
        {id: 7, titre: 'plate for street art',id_collection: 3,id_categorie:2}
    ]

    //execution de la requête préparée

    for(let i in categories){
        requete_categorie.run(categories[i].id, categories[i].libelle)
    }
    for(let i in collection){
        requete_collection.run(collection[i].id, collection[i].libelle, collection[i].permanente)
    }
    for(let i in oeuvre){
        requete_oeuvre.run(oeuvre[i].id, oeuvre[i].titre, oeuvre[i].id_collection, oeuvre[i].id_categorie)
    }

    //fin de la requête
    requete_categorie.finalize()
    requete_collection.finalize()
    requete_oeuvre.finalize()


    //lecture de la table users
    db.all("SELECT id, libelle FROM categories",(err, rows)=>{
        console.log(rows)
    })
    db.all("SELECT id, libelle, permanente FROM collection",(err, rows)=>{
        console.log(rows)
    })
    db.all("SELECT id, titre, id_collection, id_categorie FROM oeuvre",(err, rows)=>{
        console.log(rows)
    })

    //fermeture de la base
    db.close()
})