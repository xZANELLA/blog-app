const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
require("../models/Categoria");
const Categoria = mongoose.model("categorias");

router.get("/", (req, res) => {
    res.render('admin/index');
});

router.get("/posts", (req, res) => {
    res.send("Página de posts");
});

router.get("/categorias", (req, res) => {

    Categoria.find().lean().sort({date: 'desc'}).then((categorias) => {
        res.render("admin/categorias", {categorias: categorias})
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar as categorias")
        res.redirect("/admin");
    });
});

router.get("/categorias/add", (req, res) => {
    res.render("admin/addcategorias");
});

router.post("/categorias/nova", (req, res) => {

    //Validando formulario cadastro de categoria
    var erros = [];

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: "Nome inválido"});
    }

    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: "Slug inválido"});
    }

    if(req.body.nome.length < 2){
        erros.push({texto: "Nome da categoria muito pequeno"});
    }

    if(erros.length > 0){
        res.render("admin/addcategorias", {erros: erros});
    }else{
        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }
    
        new Categoria(novaCategoria).save()
        .then(() => {
            req.flash("success_msg", "Categoria criada com sucesso!");
            res.redirect("/admin/categorias");
        })
        .catch((err) => {
            req.flash("error_msg", "houve um erro ao criar a categoria, tente novamente");
            res.redirect("/admin")
        });
    }
});

router.get("/categorias/edit/:id", (req, res) => {
    
    Categoria.findOne({_id: req.params.id}).lean()
    .then((categoria) => {
        res.render("admin/editcategorias", {categoria: categoria});
    })
    .catch((err) => {
        req.flash("error_msg", "Categoria não localizada");
        res.redirect("/admin/categorias");
    });
});

router.post("/categorias/edit", (req, res) => {
    
    Categoria.findOne({_id: req.body.id})
    .then((categoria) => {

        //Validando formulario edição de categoria
        var erros = [];

        if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
            erros.push({texto: "Nome inválido"});
        }

        if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
            erros.push({texto: "Slug inválido"});
        }

        if(req.body.nome.length < 2){
            erros.push({texto: "Nome da categoria muito pequeno"});
        }

        if(erros.length > 0){
            Categoria.findOne({ _id: req.body.id }).lean().then((categoria) => {
                res.render("admin/editcategorias", { categoria: categoria, erros: erros})
            }).catch((err) => {
                req.flash("error_msg", "Erro ao pegar os dados")
                res.redirect("admin/categorias")
            })
        }else{

            categoria.nome = req.body.nome;
            categoria.slug = req.body.slug;

            categoria.save()
            .then(() => {
                req.flash("success_msg", "Categoria editada com sucesso!");
                res.redirect("/admin/categorias");
            })
            .catch((err) => {
                req.flash("error_msg", "Erro ao editar categoria");
                res.redirect("/admin/categorias");
            });
         }
    })
    .catch((err) => {
        console.log(err);
        req.flash("error_msg", "Erro ao editar a categoriaa");
        res.redirect("/admin/categorias");
    })
});

//Rota para deletar categoria
router.get("/categorias/deletar/:id", (req, res) => {
    Categoria.deleteOne({_id: req.params.id}).lean()
    .then(() => {
        req.flash("success_msg", "Categoria deletada com sucesso!");
        res.redirect("/admin/categorias");  
    })
    .catch((err) => {
        req.flash("error_msg", "Erro ao deletar a categoriaa");
        res.redirect("/admin/categorias");
    });
});
//Rota para exibir postagens
router.get("/postagens", (req, res) => {
    res.render("admin/postagens");
});

router.get("/postagens/add", (req, res) => {
    Categoria.find().lean()
    .then((categorias) => {
        res.render("admin/addpostagens", {categorias: categorias});
    })
    .catch((err) => {
        req.flash("error_msg", "Categorias não localizadas");
        redirect("/admin/postagens");
    });
});

module.exports = router;