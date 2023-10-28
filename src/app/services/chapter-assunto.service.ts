import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ChapterAssunto } from '../models/ChapterAssunto';
import { ChapterTag } from '../models/ChapterTag';


const httpOptions = {
  headers: new HttpHeaders ({
    'Content-Type' : 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('TokenUsuarioLogado')}`
  }),
};

@Injectable({
  providedIn: 'root'
})
export class ChapterAssuntoService {
  url:string = environment.apiServer + 'api/ChapterAssunto';
  javaUrl:string = "http://localhost:8080/chapter-assunto"

  constructor(private https: HttpClient) { }

  ObterTodos() : Observable<ChapterAssunto[]>
  {
    return this.https.get<ChapterAssunto[]>(this.javaUrl);
    // return this.https.get<ChapterAssunto[]>(this.url);
  }

  ObterChapterAssuntoById (chapterAssuntoId: number) : Observable<ChapterAssunto>
  {
    const apiUrl = `${this.javaUrl}/${chapterAssuntoId}`;
    return this.https.get<ChapterAssunto>(apiUrl);
    // const apiUrl = `${this.url}/${chapterAssuntoId}`;
    // return this.https.get<ChapterAssunto>(apiUrl);
  }

  NovoChapterAssunto (chapterAssunto: ChapterAssunto): Observable<any>
  {
    // return this.https.post<ChapterAssunto>(this.url, chapter, httpOptions);
    return this.https.post<ChapterAssunto>(this.javaUrl, chapterAssunto, httpOptions);
  }

  AtualizarChapterAssunto(chapterId: number, chapter: ChapterAssunto):Observable<any>
  {
    const apiUrl = `${this.url}/${chapterId}`;
    return this.https.put<ChapterAssunto>(apiUrl, chapter, httpOptions);
  }

  ExcluirChapterAssunto(cursoId: number): Observable<any>
  {
    const apiUrl = `${this.url}/${cursoId}`;
    return this.https.delete<ChapterAssunto>(apiUrl, httpOptions);
  }

  FiltrarChapterAssunto(descricaoAssunto: string) : Observable<ChapterAssunto[]>
  {
    const apiUrl = `${this.url}/FiltrarChapterAssunto${descricaoAssunto}`;
    return this.https.get<ChapterAssunto[]>(apiUrl);
  }

  AssociarTagsChapterAssunto(chapterAssuntoId: number, chapterTags: ChapterTag[]): Observable<any>
  {
    const apiUrl = `${this.javaUrl}/${chapterAssuntoId}/associar-tags`;
    return this.https.post<ChapterAssunto>(apiUrl, chapterTags, httpOptions);
  }
}
