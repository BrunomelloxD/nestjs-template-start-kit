-- CreateTable
CREATE TABLE "public"."password_reset_code" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(6) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "password_reset_code_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_code_code_key" ON "public"."password_reset_code"("code");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_code_user_id_code_key" ON "public"."password_reset_code"("user_id", "code");

-- AddForeignKey
ALTER TABLE "public"."password_reset_code" ADD CONSTRAINT "password_reset_code_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
