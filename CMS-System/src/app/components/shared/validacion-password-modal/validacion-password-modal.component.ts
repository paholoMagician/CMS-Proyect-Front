import { Component, EventEmitter, Inject, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-validacion-password-modal',
  templateUrl: './validacion-password-modal.component.html',
  styleUrls: ['./validacion-password-modal.component.scss']
})
export class ValidacionPasswordModalComponent {
  passwordIngresada: string = '';
  error: string = '';

  @Output() onPasswordValidated = new EventEmitter<boolean>();

  // 🔥 Contraseña quemada (para pruebas)
  private passwordHardcoded = 'jose';

  constructor(
    public dialogRef: MatDialogRef<ValidacionPasswordModalComponent>, 
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  validar() {
    if (!this.passwordIngresada) {
      this.error = 'Debe ingresar una contraseña';
      return;
    }

    if (this.passwordIngresada === this.passwordHardcoded) {
      this.onPasswordValidated.emit(true); // ✅ Contraseña correcta
      this.dialogRef.close(true); // 🔥 Cerrar modal enviando "true"
    } else {
      this.error = 'Contraseña incorrecta';
    }
  }

  cerrarModal() {
    this.dialogRef.close(false); // ❌ Usuario canceló la acción
  }
}
