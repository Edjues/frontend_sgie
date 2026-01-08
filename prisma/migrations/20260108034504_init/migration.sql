-- CreateTable
CREATE TABLE "permiso" (
    "id" BIGSERIAL NOT NULL,
    "descripcion" TEXT NOT NULL,

    CONSTRAINT "permiso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rol" (
    "id" BIGSERIAL NOT NULL,
    "descripcion" TEXT NOT NULL,

    CONSTRAINT "rol_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rolpermiso" (
    "id" BIGSERIAL NOT NULL,
    "rolId" BIGINT NOT NULL,
    "permisoId" BIGINT NOT NULL,

    CONSTRAINT "rolpermiso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaccion" (
    "id" BIGSERIAL NOT NULL,
    "monto" DECIMAL(18,2) NOT NULL,
    "tipo" TEXT NOT NULL,
    "fecha" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuarioId" BIGINT NOT NULL,

    CONSTRAINT "transaccion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuario" (
    "id" BIGSERIAL NOT NULL,
    "rolid" BIGINT NOT NULL,
    "nombrecompleto" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefono" TEXT,
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAtT" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "rol_descripcion_key" ON "rol"("descripcion");

-- CreateIndex
CREATE UNIQUE INDEX "rolpermiso_rolId_permisoId_key" ON "rolpermiso"("rolId", "permisoId");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_email_key" ON "usuario"("email");

-- AddForeignKey
ALTER TABLE "rolpermiso" ADD CONSTRAINT "rolpermiso_permisoId_fkey" FOREIGN KEY ("permisoId") REFERENCES "permiso"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rolpermiso" ADD CONSTRAINT "rolpermiso_rolId_fkey" FOREIGN KEY ("rolId") REFERENCES "rol"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaccion" ADD CONSTRAINT "transaccion_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuario"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "usuario" ADD CONSTRAINT "usuario_rolid_fkey" FOREIGN KEY ("rolid") REFERENCES "rol"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
