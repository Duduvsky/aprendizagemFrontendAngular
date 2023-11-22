import { Comentario } from './../../../models/Comentario';
import { Component, ElementRef, OnInit, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChapterAssuntoComentario } from 'src/app/models/ChapterAssuntoComentario';
import { ComentarioService } from 'src/app/services/comentario.service';
import { AuthGuardService } from 'src/app/services/auth-guard.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ChapterAssunto } from 'src/app/models/ChapterAssunto';
import { ChapterAssuntoService } from 'src/app/services/chapter-assunto.service';
import { Curtida } from 'src/app/models/Curtida';
import { CurtidaService } from 'src/app/services/curtida.service';
import { Usuario } from 'src/app/models/Usuario';
import { UsuariosService } from 'src/app/services/usuarios.service';
@Component({
  selector: 'app-comentarios',
  templateUrl: './comentario.component.html',
  styleUrls: ['./comentario.component.css'],
})
export class ComentarioComponent implements OnInit {
  textoSanitizado: string;
  form: FormGroup;
  comentario: ChapterAssuntoComentario = new ChapterAssuntoComentario();
  comentarios: ChapterAssuntoComentario[] = [];
  chapterAssuntos: ChapterAssunto[];
  pergunta: ChapterAssunto;
  idUsuarioLogado: string;
  currentPage: number = 1;
  itemsPerPage: number = 8;
  startIndex: number = (this.currentPage - 1) * this.itemsPerPage;
  endIndex: number = this.currentPage * this.itemsPerPage;
  totalPages: number[];
  descriptions: string[] = [];
  curtida: Curtida = new Curtida();
  curtidas: Curtida[] = [];
  comentarioCurtido: boolean;
  comentariosFilhos: ChapterAssuntoComentario[] = [];
  modalResposta: boolean = false;
  respostaFilho: FormGroup;

  @ViewChildren('comentario') comentariosDom: QueryList<ElementRef>;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private comentarioService: ComentarioService,
    private authGuardService: AuthGuardService,
    private chapterAssuntoService: ChapterAssuntoService,
    private curtidaService: CurtidaService,
    private usuarioService: UsuariosService,
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit() {
    this.idUsuarioLogado = this.authGuardService.getIdUsuarioLogado();
    let perguntaId = this.route.snapshot.params['id'];


    this.chapterAssuntoService.ObterChapterAssuntoByIdJava(perguntaId).subscribe((data) => {
      this.pergunta = data;
      this.calculateTotalPages(false);
      console.log(this.pergunta);
    });

    this.respostaFilho = new FormGroup({
      textFilho: new FormControl()
  });

    this.comentarioService.obterChapterAssuntoComentariosPorChapterAssuntoIdJava(perguntaId).subscribe((data) => {
      this.comentarios = data;
      console.log(this.comentarios);
    });

    this.form = this.fb.group({
      comentario: [null, [Validators.required, Validators.minLength(5)]],
    });

    this.comentarioCurtido = this.checarCurtida(this.curtidas, this.idUsuarioLogado);
  }

  sanitizeHTML(input: string): string {
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePage();
    }
  }

  nextPage() {
    const totalPages = Math.ceil(this.comentarios.length / this.itemsPerPage);
    if (this.currentPage < totalPages) {
      this.currentPage++;
      this.updatePage();
    }
  }

  updatePage() {
    this.startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.endIndex = Math.min(
      this.currentPage * this.itemsPerPage,
      this.comentarios.length
    );
  }

  irParaPagina(i: number) {
    this.currentPage = i;
    this.updatePage();
  }

  calculateTotalPages(filtrado: boolean) {
    if (!filtrado) {
      const itemsPerPage = this.itemsPerPage;
      if (itemsPerPage > 0) {
        const totalItems = this.comentarios.length;
        const pageCount = Math.ceil(totalItems / itemsPerPage);

        this.totalPages = Array.from(
          { length: pageCount },
          (_, index) => index + 1
        );
      } else {
        console.error(
          'O número de itens por página não está definido ou é inválido.'
        );
      }
    } else {
      const itemsPerPage = this.itemsPerPage;
      if (itemsPerPage > 0) {
        const totalItems = this.comentarios.length;
        const pageCount = Math.ceil(totalItems / itemsPerPage);

        this.totalPages = Array.from(
          { length: pageCount },
          (_, index) => index + 1
        );
      } else {
        console.error(
          'O número de itens por página não está definido ou é inválido.'
        );
      }
    }
  }

  onDelete() {}

  onSubmit() {
    var date;
    date = new Date();
    date =
      date.getUTCFullYear() +
      '-' +
      ('00' + (date.getUTCMonth() + 1)).slice(-2) +
      '-' +
      ('00' + date.getUTCDate()).slice(-2) +
      ' ' +
      ('00' + date.getUTCHours()).slice(-2) +
      ':' +
      ('00' + date.getUTCMinutes()).slice(-2) +
      ':' +
      ('00' + date.getUTCSeconds()).slice(-2);

    this.comentario.texto = this.form.value.comentario;
    this.textoSanitizado = this.sanitizeHTML(this.comentario.texto.toString());
    this.comentario.data = date;
    this.comentario.usuario.id = this.idUsuarioLogado;

    this.comentarioService
      .novoChapterAssuntoComentario(this.comentario)
      .subscribe({
        next: () => {
          location.reload();
        },
      });
  }

  onCancel() {
    console.log('onCancel');
    this.form.reset();
  }
  limparFormulario() {
    this.form.reset();
    this.descriptions = [];
  }

  verificarCampos(): boolean {
    return this.form.valid;
  }

  checarCurtida(curtidas: Curtida[], idUsuario: string): boolean {
    return curtidas.some(curtida => curtida.usuario.id === idUsuario);
  }

  curtir(comentario: ChapterAssuntoComentario) {
    this.curtida.chapterAssuntoComentarioId = comentario.id;
    this.curtida.usuarioId = this.idUsuarioLogado;
    this.curtida.rank = 1;
    this.curtidaService.postCurtida(this.curtida).subscribe({
      next: () => {
        location.reload();
      },
    });

  }

  descurtir(comentario: ChapterAssuntoComentario) {
    const curtida = comentario.curtidas.find(curtida => curtida.usuario.id == this.idUsuarioLogado);
    if (curtida) {
      this.curtidaService.deleteCurtida(curtida.id).subscribe({
        next: () => {
          location.reload();
        },
      });
    }
  }


  getPosterNameByComentarioId(id: number): string {
    let comentario = this.comentarios.find(comentario => comentario.id == id);
    return comentario!.usuario.nomeCompleto;
  }

  scrollToElement(id: number): void {
    const comentarioElement = this.comentariosDom.find(comentario => comentario.nativeElement.id === `comentario-${id}`);
    console.log(this.comentariosDom);
    console.log(comentarioElement);
    if (comentarioElement) {
      comentarioElement.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

  }

  showModalResposta() {
    this.modalResposta = true;
  }

  responder() {
    var date;
    date = new Date();
    date =
      date.getUTCFullYear() +
      '-' +
      ('00' + (date.getUTCMonth() + 1)).slice(-2) +
      '-' +
      ('00' + date.getUTCDate()).slice(-2) +
      ' ' +
      ('00' + date.getUTCHours()).slice(-2) +
      ':' +
      ('00' + date.getUTCMinutes()).slice(-2) +
      ':' +
      ('00' + date.getUTCSeconds()).slice(-2);

    this.comentario.texto = this.respostaFilho.value;
    this.textoSanitizado = this.sanitizeHTML(this.comentario.texto.toString());
    this.comentario.data = date;
    this.comentario.chapterAssuntoId = this.pergunta.id;
    this.usuarioService.ObterUsuarioPorId(this.idUsuarioLogado).subscribe((data) => {
      this.comentario.usuario = data;
    });

    // Encontrar o comentário pai pelo id do comentário atual
    const comentarioPai = this.comentarios.find(comentario => comentario.id === this.comentario.id);

    // Atribuir o id do comentário pai à propriedade paiId do comentário atual
    if (comentarioPai) {
      this.comentario.paiId = comentarioPai.id;
    }

    console.log(this.comentario);
    console.log(this.comentario.paiId);

    // Restante do seu código...
    // this.comentarioService
    //   .novoChapterAssuntoComentario(this.comentario)
    //   .subscribe({
    //     next: () => {
    //       location.reload();
    //     },
    //   });
  }




}

