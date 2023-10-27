import { Component, OnInit } from '@angular/core';
import { AuthGuardService } from 'src/app/services/auth-guard.service';
import { Grupo } from 'src/app/models/Grupo';
import { GrupoService } from 'src/app/services/grupo.service';
import { FrequenciaService } from 'src/app/services/frequencia.service';

@Component({
  selector: 'app-professor-dashboard',
  templateUrl: './professor-dashboard.component.html',
  styleUrls: ['./professor-dashboard.component.css']
})
export class ProfessorDashboardComponent implements OnInit {

  grupos: Grupo[];

  loading: boolean = true;

  idEstudanteUsuarioLogado : number;

  constructor(private grupoService: GrupoService, 
              private authGuardService: AuthGuardService,
              private frequenciaService: FrequenciaService) { }

  ngOnInit(): void {
    this.idEstudanteUsuarioLogado = this.authGuardService.getIdEstudanteUsuarioLogado();
    this.grupoService.ObterGrupoPeloEstudanteIdSemestreAtivo(this.idEstudanteUsuarioLogado).subscribe(resultado => {
      this.grupos = resultado; 
      this.grupos.forEach((grupo) => 
        this.frequenciaService.ObterFrequenciaByGrupoIdByEstudanteId(grupo.id, this.idEstudanteUsuarioLogado).subscribe(resultado => {grupo.frequencia = resultado.frequencia})
      )
      this.loading = false;
    });    
  }
}
