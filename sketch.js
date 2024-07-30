// Variáveis
let caminhao;
let carros = [];
let cidadeAlcancada = false;
let pontos = 0;
let faixasEstrada = [];
let estadoJogo = 'menu';
let intervaloCarro;  
let jogoVencido = false;
let pausado = false;
const PONTOS_PARA_CIDADE = 250; // Pontuação Máxima (Para Testes)

// Funções

function setup() {
  createCanvas(600,400);
  caminhao = new Caminhao();

  for (let i = 0; i < 10; i++) {
    faixasEstrada.push(new FaixaEstrada(i * 60));
  }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  if (pausado) {
    mostrarMenuPausa();
    return;
  }
  
  if (estadoJogo === 'menu') {
    mostrarMenu();
  } else if (estadoJogo === 'playing') {
    jogarJogo();
  } else if (estadoJogo === 'gameOver') {
    mostrarGameOver();
  }
}

function keyPressed() {
  if (estadoJogo === 'playing') {
    if (key === ' ') { 
      pausado = !pausado;
    }
  }

  if (pausado && estadoJogo === 'playing') {
    if (key === 'Enter') { 
      pausado = false;
      iniciarJogo();
    }
  } else if (estadoJogo === 'menu' && key === 'Enter') {
    iniciarJogo();
  } else if (estadoJogo === 'gameOver' && key === 'Enter') {
    reiniciarJogo();
  }
}

function mostrarMenuPausa() {
  background(0); 
  fill(255);
  textSize(32);
  textAlign(CENTER);
  text("PAUSADO", width / 2, height / 3);
  fill(0, 255, 0);
  textSize(16);
  text("Pressione ESPAÇO para continuar", width / 2, height / 1.7);
  fill(255, 0, 0);
  textSize(16);
  text("Pressione ENTER para reiniciar", width / 2, height / 1.5);
}

function mostrarMenu() {
  for (let i = 0; i < height; i++) {
    let inter = map(i, 0, height, 0, 1); 
    let c = lerpColor(color(255, 140, 0), color(255, 165, 0), inter);
    stroke(c);
    line(0, i, width, i);
  }

  background(255, 140, 0);
  fill(0, 255, 0);
  textSize(32);
  textAlign(CENTER);
  text("CONTRAPONTO ALIMENTOS", width / 2, height / 3);
  fill(255);
  textSize(16);
  text("Pressione ENTER para começar", width / 2, height / 1.5);
  fill(0, 0, 225);
  textSize(16);
  text("DO CAMPO A SUA CASA", width / 3, height / 2.5);
  textSize(14);
  text("TRANSPORTADORA", width / 4, height / 4);
  fill(255);
  textSize(14);
  text("Controles: Setas e Espaço", width / 4, height / 1.1);
}

function jogarJogo() {
  background(0);
  fill(0, 128, 0);
  noStroke();
  rect(0, 250, 150, height); // Borda esquerda
  rect(width - 0, 250, 150, height); // Borda direita

  for (let faixa of faixasEstrada) {
    faixa.mostrar();
    faixa.mover();
  }

  for (let i = carros.length - 1; i >= 0; i--) {
    if (carros[i].verificarColisaoComCarro()) {
      continue;
    }

    carros[i].mover();
    carros[i].mostrar();

    if (carros[i].colidiu(caminhao)) {
      console.log('Colisão detectada!');
      estadoJogo = 'gameOver';
      clearInterval(intervaloCarro);
    }

    if (carros[i].saiuTela()) {
      carros.splice(i, 1);
      pontos++;
    }
  }

  caminhao.mostrar();

  if (pontos >= PONTOS_PARA_CIDADE) {
    cidadeAlcancada = true;
    jogoVencido = true;
    estadoJogo = 'gameOver';
  }

  if (jogoVencido) {
    mostrarGameOver();
  } else {
    textSize(12);
    textAlign(LEFT);
    fill(255);
    text("Pontuação: " + pontos, 10, 20);
  }

  if (keyIsDown(LEFT_ARROW)) {
    caminhao.mover(-1);
  } else if (keyIsDown(RIGHT_ARROW)) {
    caminhao.mover(1);
  }
}

function mostrarGameOver() {
  background(0); 
  textAlign(CENTER);

  if (jogoVencido) {
    fill(0, 255, 0);
    textSize(40);
    text("VOCÊ CHEGOU NA CIDADE!", width / 2, height / 3);
    fill(255, 165, 0);
    textSize(23);
    text("ENTREGA CONCLUÍDA ", width / 3.5, height / 4.5);
  } else {
    fill(255, 0, 0);
    textSize(45);
    text("GAME OVER !!!", width / 2, height / 4);
    textSize(15);
    text("ACIDENTES ACONTECEM QUANDO SE BRINCA NA ESTRADA !", width / 2, height / 3.2);
  }
  fill(255);
  textSize(16);
  text("Pontuação Final: " + pontos, width / 2, height / 2);
  textSize(16);
  text("Pressione ENTER para reiniciar", width / 2, height / 1.5);
}

function iniciarJogo() {
  pontos = 0;
  cidadeAlcancada = false;
  jogoVencido = false;
  carros = [];
  estadoJogo = 'playing';

  if (intervaloCarro) {
    clearInterval(intervaloCarro);
  }

  intervaloCarro = setInterval(function() {
    let xPos = random(100, width - 100);
    carros.push(new Carro(xPos));
  }, 1500);
}

function reiniciarJogo() {
  estadoJogo = 'menu';
  jogoVencido = false;
  clearInterval(intervaloCarro);
  carros = [];
  pontos = 0;
  cidadeAlcancada = false;
  caminhao.x = width / 2;
  caminhao.y = height - 75;
}

// Classe Caminhao

class Caminhao {
  constructor() {
    this.x = width / 2;
    this.y = height - 75;
    this.larguraCorpo = 60;
    this.alturaCorpo = 100;
    this.larguraCabine = 50;
    this.alturaCabine = 40;
    this.diametroFarol = 12;
    this.velocidade = 4;
    this.minX = 100;
    this.maxX = width - 100;
  }

  mostrar() {
    fill(255, 0, 0);
    rectMode(CENTER);
    rect(this.x, this.y, this.larguraCorpo, this.alturaCorpo);
    fill(0, 0, 255);
    rect(this.x, this.y - this.alturaCorpo / 2, this.larguraCabine, this.alturaCabine);
    fill(255);
    rect(this.x - this.larguraCabine / 4, this.y - this.alturaCorpo / 2, 20, 15);
    rect(this.x + this.larguraCabine / 4, this.y - this.alturaCorpo / 2, 20, 15);
    fill(255, 255, 0);
    ellipse(this.x - this.larguraCorpo / 2.5, this.y - this.alturaCorpo / 4, this.diametroFarol, this.diametroFarol);
    ellipse(this.x + this.larguraCorpo / 2.5, this.y - this.alturaCorpo / 4, this.diametroFarol, this.diametroFarol);
  }
 mover(dir) {
    let novaPosX = this.x + dir * this.velocidade;
    if (novaPosX > this.minX && novaPosX < this.maxX) {
      this.x = novaPosX;
    }
  }

  chegouCidade() {
    return this.y < height / 4;
  }
}

// Classe Carro

class Carro {
  constructor(x) {
    this.x = x;
    this.y = random(-height, -50);
    this.larguraCorpo = 40;
    this.alturaCorpo = 60;
    this.tamanhoRoda = 6;
    this.velocidade = random(2, 6);
    this.cor = color(random(255), random(255), random(255));
  }

  mostrar() {
    fill(this.cor);
    rectMode(CENTER);
    rect(this.x, this.y, this.larguraCorpo, this.alturaCorpo);
    fill(0);
    rect(this.x, this.y - this.alturaCorpo / 4, this.larguraCorpo / 3, this.alturaCorpo / 2);
    fill(200);
    rect(this.x - this.larguraCorpo / 6, this.y - this.alturaCorpo / 4, 20, 10);
    rect(this.x + this.larguraCorpo / 6, this.y - this.alturaCorpo / 4, 20, 10);
    fill(100);
    rect(this.x, this.y + this.alturaCorpo / 2, this.larguraCorpo / 4, 8);
    fill(255, 0, 0);
    ellipse(this.x - this.larguraCorpo / 4, this.y + this.alturaCorpo / 3, this.tamanhoRoda);
    ellipse(this.x + this.larguraCorpo / 4, this.y + this.alturaCorpo / 3, this.tamanhoRoda);
  }

  mover() {
    this.y += this.velocidade;
  }

  saiuTela() {
    return this.y > height + this.alturaCorpo;
  }

  colidiu(caminhao) {
    return (
      this.x < caminhao.x + caminhao.larguraCorpo / 2 &&
      this.x > caminhao.x - caminhao.larguraCorpo / 2 &&
      this.y < caminhao.y + caminhao.alturaCorpo / 2 &&
      this.y > caminhao.y - caminhao.alturaCorpo / 2
    );
  }
  
  verificarColisaoComCarro() {
    for (let outroCarro of carros) {
      if (outroCarro !== this) {
        if (dist(this.x, this.y, outroCarro.x, outroCarro.y) < this.alturaCorpo / 2) {
          return true;
        }
      }
    }
    return false;
  }
}

// Classe Faixa da Rodovia

class FaixaEstrada {
  constructor(y) {
    this.y = y;
    this.x = width / 2;
    this.largura = 10;
    this.altura = 40;
    this.velocidade = 4;
  }

  mostrar() {
    fill(255);
    rectMode(CENTER);
    rect(this.x, this.y, this.largura, this.altura);
  }

  mover() {
    this.y += this.velocidade;
    if (this.y > height + this.altura / 2) {
      this.y = -this.altura / 2;
    }
  }
}